"use client";
import React, { useEffect, useState } from 'react'
import styles from './page.module.css'
import { Header } from './components/Header';
import { Register, create, init, setMemory } from './register';
import { Terminal } from './components/Terminal';
import { Memory } from './components/Memory';
import { Console } from './components/Console';
import { Editer } from './components/Editer';

export default function Home() {
  const [register, setRegister] = useState<Register>(init())
  const [outputs, setOutputs] = useState<string>("");
  const [tab, setTab] = useState<"terminal" | "editer">("terminal");
  const [stopProc, setStopProc] = useState<string>("none")

  useEffect(()=>{

    const phreses = stopProc.split(" ").filter(e=>e);
    if(phreses[0]!=="submit") return;
    console.log(phreses)
    switch(phreses[1]){
    case "input_int":
        setMemory(register, Number(phreses[4]), Number(phreses[2]), Number(phreses[3])*4);
        setRegister(r=>create(r));
        break;
    case "input_char":
      for(var i = 0;i < Number(phreses[3]);++i){
        var value = phreses[4+i]===undefined?0:phreses[4+i];
        setMemory(register, Number(value), Number(phreses[2])+32*i, 32);
        setRegister(r=>create(r));
      }
      break;
    }
    if(stopProc!=="none") setStopProc("none");
  }, [stopProc])
  return (
    <main className={styles.main}>
      <Header></Header>
      <div className={styles.content}>
        <div> 
          <div onClick={()=>tab==="terminal"?setTab("editer"):setTab("terminal")} className={styles.switch_btn}>Switch Mode</div>
        {tab==="terminal"?
        <Terminal register={register} setRegister={setRegister} setOutputs={setOutputs} stopProc={stopProc} setStopProc={setStopProc}/>:
        <Editer register={register} setRegister={setRegister} setOutputs={setOutputs} stopProc={stopProc} setStopProc={setStopProc}/>
        }
        </div>
        <Memory register={register}/>
      </div>
      <Console outputs={outputs} setOutput={setOutputs} stopProc={stopProc} setStopProc={setStopProc}/>
    </main>
  )
}
