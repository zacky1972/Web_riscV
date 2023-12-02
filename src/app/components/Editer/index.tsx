import { Register, create, init, resetDelta } from "@/app/register"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styles from "@/app/components/Editer/editer.module.css"
import { compile, processCommand } from "@/app/compile"

export const Editer = ({
	register, setRegister, setOutputs, stopProc, setStopProc
}:{
	register: Register, setRegister: Dispatch<SetStateAction<Register>>, setOutputs: Dispatch<SetStateAction<string>>,
	stopProc:string, setStopProc:Dispatch<SetStateAction<string>>
})=>{
	const [commands, setCommands] = useState<Array<string>>([""]);
	const [compiled, setCompiled] = useState<Array<string>>([]);
	const [errors, setErrors] = useState<Array<{e:string, i:number}>>([])
	const [labels, setLabels] = useState<Array<Label>>([]);
	const [focused, setFocused] = useState<number>(0);
	const [pc, setPC] = useState<number>(-1);

	const [c2c, setC2C] = useState<Array<number>>([]);
	const [i_compile, setI_Compile] = useState<number>(-1);
	const [isProcessing, setIsProc] = useState<boolean>(false);
	const [isCompiled, setIsCompiled] = useState<boolean>(false);
	const [isFirstLoad, setIsFL] = useState<boolean>(true);

	const handleEnterCommand = ()=>{
		setCompiled([]);
		setErrors([]);
		setC2C([]);
		setIsCompiled(true);
	}
	const handleRun = ()=>{
		setRegister(init())
		setPC(0)
	}
	const handleStep = ()=>{
		setRegister(init())
		setIsProc(true);
		setPC(0);
	}
	const handleReset = ()=>{
		setCommands([""]);
		setErrors([]);
		setCompiled([]);
	}

	useEffect(() =>{
		if(!isCompiled) return;
    console.log("----------entered--------------");
    resetDelta(register);

		var command = commands[0]
		commands.forEach((c, i)=>{i===0?0:command+="\n"+c})
		compile(command, setCompiled, labels, setLabels, register, compiled);
		setCompiled([]);
		setI_Compile(0);

		console.log(commands);
		setIsCompiled(false);
  }, [isCompiled])
	useEffect(()=>{
		if(i_compile < 0) return;
		if(i_compile >= commands.length) {
			setI_Compile(-1)
			return;
		}

		console.log(`${i_compile}:start`)
		const result = [compile(commands[i_compile], setCompiled, labels, setLabels, register, compiled)];
		console.log(`${i_compile}:finish`)

		if(result[0].error==="none") setC2C(c=>[...c, i_compile])
		if(result[0].error!=="empty"){
			if(result[0].error!=="none")
				setErrors(es=>[...es, {e:result[0].error, i:i_compile}])
		}

		setI_Compile(i=>i+1);
	})
	useEffect(()=>{
		if(pc < 0) return;
		if(pc >= compiled.length) {
			console.log("fin")
			setIsProc(false);
			return
		};
		const res = processCommand(compiled, pc, register, setPC, setOutputs);

		if(res!=="none") {
			setStopProc(res)
			return;
		};
		setRegister(r=>create(r));
		console.log(`${isProcessing}:aaa`)

		if(isProcessing) return;//ステップ実行の場合、pcの自動更新を止める

		setPC(p=>p+1);
	}, [pc])
	useEffect(()=>{
		if(isFirstLoad){
			setIsFL(false);
			return;
		}
		if(stopProc==="none") setPC(c=>c+1);
	},[stopProc])

	const handleKeyInputs = (e: React.KeyboardEvent, index: number) => {
    if(e.nativeEvent.isComposing) return;

		switch(e.key){
		case "Enter":
			const cs = [...commands];
			cs.splice(index+1, 0, "");
			setCommands(cs);
		case "ArrowDown":
			setFocused(index+1);
			break;
		case "ArrowUp":
			setFocused(index-1);
			break;
		}
	}
	const isCommandsEmpty = ():boolean=>{
		for(var i = 0;i < commands.length; ++i){
			if(commands[i]!=="") return false;
		}
		return true;
	}
	const isExecutable = ():boolean=>{
		return (compiled.length>0 && errors.length===0)
	}
	useEffect(()=>{
		document.getElementById(`input:${focused}`)?.focus();
	},[focused])
	useEffect(()=>{console.log(compiled)}, [compiled])

	const lines:Array<{content:string, index:number}> = [];
	commands.forEach((c, i)=>{
		lines.push({content:c, index:i})
		const er = errors.filter(e=>e.i===i);
		if(er.length>0) lines.push({content:er[0].e, index:-1})
	})
	return(
		<div className={styles.editer}>
			<div className={styles.buttons}>
				{isCommandsEmpty()||isProcessing?
					<div className={styles.disable}>Compile</div>:
					<div onClick={handleEnterCommand} className={styles.button}>Compile</div>
				}
				{isExecutable()?isProcessing?
					<div className={styles.button} onClick={()=>{setPC(-1);setIsProc(false)}}>Stop</div>:
					<div className={styles.button} onClick={handleRun}>Run</div>:
					<div className={styles.disable}>Run</div>
				}
				{isExecutable()?isProcessing?
					<div className={styles.button} onClick={()=>setPC(p=>p+1)}>Next</div>:
					<div className={styles.button} onClick={handleStep}>Step</div>:
					<div className={styles.disable}>Step</div>
				}
				{(isCommandsEmpty()||isProcessing)?
					<div className={styles.disable}>Reset</div>:
					<div className={styles.button} onClick={handleReset}>Reset</div>
				}
			</div>
			{lines.map((v, i)=>{
				if(v.index<0){
					return(
						<div key={i} className={styles.error}>{v.content}</div>
					)
				} else {
					return(
						<div key={i} className={styles.line}>{v.index}|
							<input 
								id={`input:${v.index}`} type="text" value={v.content} 
								onKeyDown={(e)=>handleKeyInputs(e, v.index)} onClick={()=>setFocused(v.index)}
								onChange={(e)=>{
									const cs = [...commands];
									cs[v.index] = e.target.value;
									setCommands(cs);
									console.log(commands)
								}}
								readOnly={isProcessing}
								style={(isProcessing&&i===c2c[pc])?{color:"aqua"}:{}}
							/>
						</div>
					)
				}
			})}
		</div>
	)
}