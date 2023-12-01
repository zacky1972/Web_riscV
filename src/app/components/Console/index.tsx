import styles from "@/app/components/Console/console.module.css"
import { Dispatch, SetStateAction, useEffect } from "react"

export const Console = (
	{outputs}:
	{outputs: string}
)=>{
	useEffect(()=>{
		console.log("output updated")
		document.getElementById(`${outputs.length-1}`)?.scrollIntoView()
	}, [outputs])
	return(
		<div className={styles.console}>
			{outputs}
		</div>
	)
}