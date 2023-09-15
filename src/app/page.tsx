"use client";
import React, { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import { Header } from './components/Header';
import { processCommand } from './compile';
import { Register, init, resetDelta, toHex } from './register';

export default function Home() {
  const [tab, setTab] = useState<number>(0);
  //command
  const [command, setCommand] = useState<string>("");
  const [commands, setCommands] = useState<Array<Msg>>([]);
  const [counter, setCounter] = useState<number>(0);
  const [pc, setPC] = useState<number>(0);
  const [selectCounter, setSCounter] = useState<number>(0);

  const [tempCommand, setTCommand] = useState<string>("");

  const cmdLineRef = useRef<HTMLTextAreaElement>(null);
  //register
  const [register, setRegister] = useState<Register>(init())

  // useEffect(()=>{
  //   setRegister(init())
  // }, [])
  const handleEnterCommand = () =>{
    resetDelta(register);

    setCounter(c=>c+1);
    setSCounter(counter);

    const sentences = command.split("\n").filter(e=>e)
    
    const res = processCommand([...commands.filter(c=>c.type==="cmd").map(c=>c.content), ...sentences], pc, register, setCommands, setPC);
    // sentences.map((c, i)=>{
    //   if(res){
    //     setCommands(cmds => [...cmds, {content:c, type:"cmd"}]);
    //     setPC(p=>p+1);
    //   }
    //   else{
    //     setCommands(cmds => [...cmds, {content:c, type:"wrong"}]);
    //   }
    //   console.log(`c:${c}`)
    //   console.log(commands)
    // })
    setCommand("");
    console.log("cmd:"+command);
  }
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
      setCommand(commands[selectCounter].content);

      //Debug>
      console.log(`${selectCounter}:${command}`)
    case "ArrowDown":
      if(command!=="" || selectCounter >= counter) return;
      if(selectCounter == counter) {
        setCommand(tempCommand);
        return;
      }
      setSCounter(c=>c+1);
      setCommand(commands[selectCounter].content);

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

  const toHexadecimal = (n:number, l:number) =>{
    if(n < 0){}

    var hex = n.toString(16);
    while(hex.length < l){
      hex = "0" + hex;
    }
    return "0x" + hex;
  }

  return (
    <main className={styles.main}>
      <Header></Header>
      <div className={styles.content}>
        <div className={styles.terminal} onClick={()=>cmdLineRef.current?.focus()}>
          {commands.map((c, i)=><div key={i} className={
            c.type==="err"?styles.msg_err:c.type==="wrong"?styles.msg_wrong:styles.command
          }>{c.content}</div>)}
          <textarea ref={cmdLineRef} value={command} onKeyDown={handleKeyInputs} onChange={e=>{setCommand(e.target.value)}} rows={1}/>
        </div>
        <div className={styles.contener}>
          <div className={styles.tabs}>
            <div className={tab===0?styles.selected:styles.noselect} onClick={()=>{if(tab!==0)setTab(0)}}>Register</div>
            <div className={tab===0?styles.noselect:styles.selected} onClick={()=>{if(tab===0)setTab(1)}}>Memory</div>
            {tab===0?<></>:
          <div className={styles.pages}>
            {[...Array<number>(3)].map((v,i)=>(
              <div key={i} onClick={()=>{if(tab!==i+1)setTab(i+1)}} className={tab===i+1?styles.selected:styles.noselect}>{i+1}</div>
            ))}
          </div>
      }
          </div>
          <div className={styles.registers}>
            {[...Array<number>(2)].map((v, i)=>(<div key={i} className={styles.memories}>
            {[...Array<number>(16)].map((v, j)=>{
              var name:string;
              var address:number;
              var isChanged:boolean = false;

              const k = j+i*16;

              for(var l = 0;l < register.delta.length;++l){
                if((k+tab*32)===register.delta[l]){
                  console.log(`k:${k}`);
                  isChanged = true;
                  break;
                }
              }

              if(tab===0){
                name = register.reg_names[k].name;
                address = register.reg_names[k].value;
              }
              else{
                name = toHexadecimal(128*tab+k*4, 3);
                address = 1024*tab+k*32;
              }
              return(
                <div key={name} className={`${styles.memory} ${isChanged?styles.changed:''}`}><p>{name}</p><p>0x{toHex(register, address, 32)}</p></div>
              )
            })}
            </div>))}
          </div>
        </div>
      </div>
    </main>
  )
}
