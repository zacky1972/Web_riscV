import { compile, processCommand } from "@/app/compile";
import styles from "@/app/components/Terminal/terminal.module.css"
import { Register, create, resetDelta } from "@/app/register";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export const Terminal = ({
	register, setRegister
}:{
	register:Register, setRegister:Dispatch<SetStateAction<Register>>
})=>{
	//command
  const [command, setCommand] = useState<string>("");
  //コマンドラインのすべての入力を分類し格納
  const [commandline, setCommandLine] = useState<Array<Code>>([]);
  //コンパイル後のコマンドを格納
  const [commands, setCommands] = useState<Array<string>>([]);
  const [labels, setLabels] = useState<Array<Label>>([]);
  const [counter, setCounter] = useState<number>(0);
  const [pc, setPC] = useState<number>(0);
  const [selectCounter, setSCounter] = useState<number>(0);

  const [tempCommand, setTCommand] = useState<string>("");

  const cmdLineRef = useRef<HTMLTextAreaElement>(null);

	const handleEnterCommand = () =>{
    console.log("----------entered--------------");
    resetDelta(register);

    setCounter(c=>c+1);
    setSCounter(counter);
    
    const result = [compile(command, setCommands, labels, setLabels, register, commands)];
    if(result[0].error !== "none") result.push({content:result[0].error, error:"this"})
    setCommandLine(cl=>[...cl, ...result])
    setCommand("");
  }
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
	const handleKeyInputs = (e: React.KeyboardEvent) => {
    if(e.nativeEvent.isComposing) return;

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
      if(command!=="" || selectCounter < 0) return;
      if(selectCounter == counter) setTCommand(command)
      setSCounter(c=>c-1);
      setCommand(commandline[selectCounter].content);

      //Debug>
      console.log(`${selectCounter}:${command}`)
    case "ArrowDown":
      if(command!=="" || selectCounter >= counter) return;
      if(selectCounter == counter) {
        setCommand(tempCommand);
        return;
      }
      setSCounter(c=>c+1);
      setCommand(commandline[selectCounter].content);

      //Debug>
      console.log(`${selectCounter}:${command}`)
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