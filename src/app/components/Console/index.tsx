import styles from "@/app/components/Console/console.module.css"
import { setMemory } from "@/app/register"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

export const Console = ({
	outputs, setOutput, stopProc, setStopProc
}:{
	outputs: string, setOutput:Dispatch<SetStateAction<string>>
	stopProc:string, setStopProc:Dispatch<SetStateAction<string>>
})=>{
	const [integer, setInt] =useState<string>("")
	const [text, setText] =useState<string>("")
	const mode = stopProc.split(" ");
	useEffect(()=>{
		console.log("output updated")
		console.log(outputs)
		document.getElementById(`end`)?.scrollIntoView()
	}, [outputs])
	useEffect(()=>{
		console.log("stop:"+stopProc)
		switch(mode[0]){
		case "input_int":
			document.getElementById("input_int")?.focus()
			break;
		case "input_char":
			document.getElementById("input_char")?.focus()
			break;
		}
	}, [stopProc])

	const handleSubmit = (m:number)=>{
		switch(m){
		case 0:
			setOutput(o=>`${o}${integer}\n`)
			setInt("");
			setStopProc(sp=>"submit "+sp+" "+integer);
			break;	
		case 1:
			setOutput(o=>`${o}${text}\n`)
			setText("");
			var value = "";
			for(var i = 0;i < Number(mode[2]);++i){
				var v = text.charCodeAt(i)
				if(!v) v=0;
				value += " "+v;
			}
			setStopProc(sp=>"submit "+sp+" "+value);
			console.log(value)
			break;
		}
		console.log("submit input!");
		
	}
	return(
		<div className={styles.console}>
			{outputs}
			{mode[0]==="input_int"?
				<input 
					type="number" value={integer} id="input_int"
					onChange={(e)=>setInt(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")handleSubmit(0)}}
				/>
			:mode[0]==="input_char"?
				<input 
					type="text" value={text}  id="input_char"
					onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")handleSubmit(1)}}
				/>
			:<></>
			}
			<div id="end"></div>
		</div>
	)
}