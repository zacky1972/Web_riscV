import styles from "@/app/components/Memory/memory.module.css"
import { Register, toHex } from "@/app/register"
import { useState } from "react";

export const Memory = ({
	register
}:{
	register: Register
})=>{
  const [tab, setTab] = useState<number>(0);

	const toHexadecimal = (n:number, l:number) =>{
    if(n < 0){}

    var hex = n.toString(16);
    while(hex.length < l){
      hex = "0" + hex;
    }
    return "0x" + hex;
  }

  return (
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
	)
}