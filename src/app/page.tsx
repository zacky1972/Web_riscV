"use client";
import React, { useState } from 'react'
import styles from './page.module.css'
import { Header } from './components/Header';
import { Register, init } from './register';
import { Terminal } from './components/Terminal';
import { Memory } from './components/Memory';
import { Console } from './components/Console';
import { Editer } from './components/Editer';

export default function Home() {
  const [register, setRegister] = useState<Register>(init())
  const [outputs, setOutputs] = useState<string>("");
  const [tab, setTab] = useState<"terminal" | "editer">("terminal");
  return (
    <main className={styles.main}>
      <Header></Header>
      <div className={styles.content}>
        <div> 
          <div onClick={()=>tab==="terminal"?setTab("editer"):setTab("terminal")}>Switch Mode</div>
        {tab==="terminal"?
        <Terminal register={register} setRegister={setRegister} setOutputs={setOutputs}/>:
        <Editer register={register} setRegister={setRegister} setOutputs={setOutputs}/>
        }
        </div>
        <Memory register={register}/>
      </div>
      <Console outputs={outputs}/>
    </main>
  )
}
