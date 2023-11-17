"use client";
import React, { useState } from 'react'
import styles from './page.module.css'
import { Header } from './components/Header';
import { Register, init } from './register';
import { Terminal } from './components/Terminal';
import { Memory } from './components/Memory';

export default function Home() {
  const [register, setRegister] = useState<Register>(init())
  const [test_elem, setTestElem] = useState<Array<string>>([])
  return (
    <main className={styles.main}>
      <Header></Header>
      <div className={styles.content}>
        <Terminal register={register} setRegister={setRegister}/>
        <Memory register={register}/>
      </div>
    </main>
  )
}
