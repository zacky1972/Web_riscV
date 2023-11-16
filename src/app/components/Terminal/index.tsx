import { compile, processCommand } from "@/app/compile";
import styles from "@/app/components/Terminal/terminal.module.css"
import { Register, create, resetDelta } from "@/app/register";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export const Terminal = ({
	register, setRegister
}:{
	register:Register, setRegister:Dispatch<SetStateAction<Register>>
})=>{
	const [key_counter, setKC] = useState<number>(0);
	//command
  const [command, setCommand] = useState<string>("");
  //コマンドラインのすべての入力を分類し格納
  const [commandline, setCommandLine] = useState<Array<Code>>([]);
  //コンパイル後のコマンドを格納
  const [commands, setCommands] = useState<Array<string>>([]);
  const [labels, setLabels] = useState<Array<Label>>([]);
  const [pc, setPC] = useState<number>(0);
  const [selecter, setSelecter] = useState<number>(0);

  const [tempCommand, setTCommand] = useState<string>("");

  const cmdLineRef = useRef<HTMLTextAreaElement>(null);

	const handleEnterCommand = () =>{
    console.log("----------entered--------------");
    resetDelta(register);

    setSelecter(0);
		setTCommand("");
    
    const result = [compile(command, setCommands, labels, setLabels, register, commands)];
    if(result[0].error !== "none") result.push({content:result[0].error, error:"this"})
    setCommandLine(cl=>[...cl, ...result])
    setCommand("");
  }
	//コマンドリスト、プログラムカウンターが更新された際コマンドを実行
  useEffect(()=>{
    console.log("commands:")
    console.log(commands)
    if(pc < commands.length){
      console.log("process" + pc +":"+ commands[pc]);
      processCommand(commands, pc, register, setPC);
      setPC(c=>c+1);
			setRegister(r=>create(r));
    }
  }, [commands, pc])
	//セレクターが更新された際セレクターに合わせたコマンドをセット
	useEffect(()=>{
		console.log(`selector updated:${selecter}`)
		const log = commandline.filter(c=>c.error!=="this");
		if(log.length > 0){
			if(selecter === 0)
				setCommand(tempCommand)
			else
				setCommand(log[log.length - selecter].content);
		} 
	}, [selecter])
	const handleKeyInputs = (e: React.KeyboardEvent) => {
    if(e.nativeEvent.isComposing) return;

		setKC(kc=>kc+1);

    switch(e.key){
    case "Enter":
      if(e.shiftKey){
        if(cmdLineRef.current?.rows)
          cmdLineRef.current.rows += 1;
        setCommand(c=>c+"\n");
      }
      else
        handleEnterCommand();
      console.log("enter");
      e.preventDefault();
      break;
    case "ArrowUp":
			var log = commandline.filter(c=>c.error!=="this");
      if(selecter >= log.length) return;
			if(selecter === 0){
				setTCommand(command);
			}
      setSelecter(s=>{console.log("selector up");return s+1});
      //Debug>
      console.log(`${selecter}:${command}`)
			break;
    case "ArrowDown":
			var log = commandline.filter(c=>c.error!=="this");
      if(selecter <= 0) return;
      setSelecter(s=>(s-1));
      //Debug>
      console.log(`${selecter}:${command}`)
			break;
    case "Backspace":
      if(command[command.length-1]==="\n"){
        if(cmdLineRef.current?.rows)
          cmdLineRef.current.rows -= 1;
      }
      break;
    default:
      // console.log(`key:${e.key}`)
      break;
    }
  }
  return(
		<div className={styles.terminal} onClick={()=>cmdLineRef.current?.focus()}>
      {commandline.map((c, i)=><div key={i} className={
        c.error==="none"?styles.command:c.error==="this"?styles.msg_err:styles.msg_wrong
      }>{c.content}</div>)}
      <textarea ref={cmdLineRef} value={command} onKeyDown={handleKeyInputs} onChange={e=>{setCommand(e.target.value)}} rows={1}/>
    </div>
  )
}