import React, { Dispatch, SetStateAction } from "react";
import { Register, copyMemory, n2m, setMemory, toNumber } from "./register";

export const processCommand = (
	cmd: Array<string>, pc: number, register: Register, 
	setPC: React.Dispatch<React.SetStateAction<number>>
) => {
	

  	// const errorMsg = (code: number, data:Array<string>) => {
	// 	var msg:string;
	// 	switch(code){
	// 	case 0:
	// 	msg = `command "${data[0]}" is not exist`
	// 	break;
	// 	case 1:
	// 	msg = `${data[0]} is not number`
	// 	break;
	// 	case 2:
	// 	msg = `register "${data[0]}" is not exist`
	// 	break;
	// 	case 3:
	// 	msg = `wrong argument. follow this format:${data[0]}`
	// 			break;
	// 		case 4:
	// 			msg = `symbol "${data[0]}" is not exist`;
	// 	}
	// 	response = false;
  	// }
	if(pc >= cmd.length) console.log("segmentetion foult!!")
	console.log(pc + "↓")
	console.log(cmd)
	const phrases = cmd[pc].split(" ").filter(e=>e);

  	switch(phrases[0]){
	case "li":
		setMemory(register, Number(phrases[2]), Number(phrases[1]), 32);
		break;
	case "lb":case "lbu": case "lh": case "lhu": case "lw":
		var val:number = 0;
		switch(phrases[0]){
		case "lb":
			val = toNumber(register, Number(phrases[2]), 8, true);
			console.log(`val:${val}`);
			break;
		case "lbu":
			val = toNumber(register, Number(phrases[2]), 8, false);
			break;
		case "lh":
			val = toNumber(register, Number(phrases[2]), 16, true);
			console.log(`val:${val}`);
			break;
		case "lhu":
			val = toNumber(register, Number(phrases[2]), 16, false);
			break;
		case "lw":
			val = toNumber(register, Number(phrases[2]), 32, true);
		}
		setMemory(register, val, Number(phrases[1]), 32);
		break;
	case "addi": case "subi":
		var value_1 = toNumber(register, Number(phrases[2]), 32, true);
		switch(phrases[0]){
		case "addi":
			setMemory(register, value_1+Number(phrases[3]), Number(phrases[1]), 32);
			break;
		case "subi":
			setMemory(register, value_1-Number(phrases[3]), Number(phrases[1]), 32);
			break;
		}
		break;
	case "add": case "sub":
		var value_1 = toNumber(register, Number(phrases[2]), 32, true);
		var value_2 = toNumber(register, Number(phrases[3]), 32, true);

		switch(phrases[0]){
		case "add":
			setMemory(register, value_1+value_2, Number(phrases[1]), 32);
			break;
		case "sub":
			setMemory(register, value_1-value_2, Number(phrases[1]), 32);
			break;
		}
		break;
	case "sb":
		setMemory(register, toNumber(register, Number(phrases[1]), 8, false), Number(phrases[2]), 32);
		break;
	case "sh":
		setMemory(register, toNumber(register, Number(phrases[1]), 16, false), Number(phrases[2]), 32);
		break;
	case "sw":
		setMemory(register, toNumber(register, Number(phrases[1]), 32, false), Number(phrases[2]), 32);
		break;
	case "mv":
		copyMemory(register, Number(phrases[2]), Number(phrases[1]), 32);
		break;
	case "jal":
		setPC(Number(phrases[2]))
		setMemory(register, pc+1, Number(phrases[1]), 32);
		break;
	case "j":
		setPC(Number(phrases[1]))
		break;
	case "beq":case "bne":case "bge":case "bgeu":case "bgt":case "bgtu":case "ble":case "bleu":case "blt":case "bltu":
		const val_1 = toNumber(register, Number(phrases[1]), 32, !phrases[0].match(/u$/));
		const val_2 = toNumber(register, Number(phrases[2]), 32, !phrases[0].match(/u$/));
		var flag = (()=>{
			switch(phrases[0]){
			case "beq":				return (val_1 === val_2);
			case "bne":				return (val_1 !== val_2);
			case "bge":case "bgeu":	return (val_1 >= val_2);
			case "bgt":case "bgtu":	return (val_1 > val_2);
			case "ble":case "bleu":	return (val_1 <= val_2);
			case "blt":case "bltu": return (val_1 < val_2);
			}
		})();
		if(flag) setPC(Number(phrases[3]))
		break;
	default:
		console.log(cmd);
  	}
	console.log("pc is " + pc)
	// setPC(p=>p+1);
}

export const compile = (
	code: string, setCommands: Dispatch<SetStateAction<Array<string>>>, 
	labels: Array<Label>, setLabels: Dispatch<SetStateAction<Array<Label>>>, 
	register: Register, commands: Array<string>
):Code=>{
	const cmds = code.split("\n");
	const temp_labels: Array<Label> = [...labels];
	var error = "";
	cmds.forEach((c,i)=>{
		if(c.match(/:$/))
			temp_labels.push({name: c.slice(0, c.length-1), index: i+commands.length})
	})
	console.log(temp_labels);
	
	const errorMsg = (code: number, data:Array<string>) => {
		var msg:string;
		switch(code){
		case 0:
			msg = `command "${data[0]}" is not exist`
			break;
		case 1:
			msg = `${data[0]} is not number`
			break;
		case 2:
			msg = `register "${data[0]}" is not exist`
			break;
		case 3:
			msg = `wrong argument. follow this format:${data[0]}`
			break;
		case 4:
			msg = `symbol "${data[0]}" is not exist`;
			break;
		default:
			msg = "none"
		}
		error = msg;
  	}

	const isValidLength = (phrases: Array<string>, lens: Array<number>, format:string) =>{
		for(var i = 0;i < lens.length;++i){
			console.log(`${lens[i]}:${phrases.length}`)
			if(phrases.length === lens[i]) return i+1;	
		};

		errorMsg(3, [format])
		return 0;
	}
	const isValidRegister = (name:string) =>{
		const reg = n2m(register, name);
		console.log("passReg");//D
		if(reg!==-1) return reg;

    	errorMsg(2, [name])

    	return undefined;
	}
	const isValidNumber = (n:string) =>{
		const value = Number(n)
		console.log("passNumber"+n)//D
		if(value || value===0) return value;

    	errorMsg(1, [n])
		return undefined;
	}
	const isValidNpR = (arg:string) =>{
		var value:number|undefined;
		if(!(value=Number(arg))) {
			const mini_ph = arg.split(/\(|\)/).filter(e=>e);
			var address:number|undefined;
			if(!isValidLength(mini_ph, [2], "immidiate or immidiate(register)")) return undefined;
			// console.log("pass0")//D
			if((value=isValidNumber(mini_ph[0]))===undefined || (address=isValidRegister(mini_ph[1]))===undefined)return undefined;

			// console.log(`pass1:${address}`)//D

			value += toNumber(register, address, 32, false);
		}
		return value;
	}
	const isValidLabel = (label:string) =>{
		for(var i = temp_labels.length-1;i >= 0;--i){
			if(temp_labels[i].name===label) return temp_labels[i].index 
		}
		return -1;
	}
	const compiled:Array<string> = cmds.map(c=>{
		if(error !== "") return "error";

		const phrases = c.split(" ").filter(e=>e);

  		switch(phrases[0]){
		case "li":
    		if(!isValidLength(phrases, [3], "li 'register' 'immediate'")) break;
			var address:number|undefined;
			if((address=isValidRegister(phrases[1]))===undefined) break;
				
			var value:number|undefined;
			if((value=isValidNumber(phrases[2]))===undefined) break;

			return `li ${address} ${value}`
		case "lb":case "lbu": case "lh": case "lhu": case "lw":
			if(!isValidLength(phrases, [3], `${phrases[0]} 'register' 'immidiate | immidiate(register)'`)) break;
			var address_1:number|undefined;
			if((address_1=isValidRegister(phrases[1]))===undefined) break;
		
			var address_2:number|undefined;
			if(!(address_2=isValidNpR(phrases[2]))) break;

			return `${phrases[0]} ${address_1} ${address_2}`
		case "addi": case "subi":
			if(!isValidLength(phrases, [4], `${phrases[0]} 'register' 'register' 'immediate'`)) break;
			var address_dist:number|undefined;
			if((address_dist=isValidRegister(phrases[1]))===undefined) break;

			var address_src:number|undefined;
			if((address_src=isValidRegister(phrases[2]))===undefined) break;
				
			var value_2:number|undefined;
			if((value_2=isValidNumber(phrases[3]))===undefined) break;

			return `${phrases[0]} ${address_dist} ${address_src} ${value_2}`
		case "add": case "sub":
			if(!isValidLength(phrases, [4], `${phrases[0]} 'register' 'register' 'register'`)) break;
    		var address_dist:number|undefined;
    		if((address_dist=isValidRegister(phrases[1]))===undefined) break;

			var address_src_1:number|undefined;
    		if((address_src_1=isValidRegister(phrases[2]))===undefined) break;
		
    		var address_src_2:number|undefined;
			if((address_src_2=isValidRegister(phrases[3]))===undefined) break;

			return `${phrases[0]} ${address_dist} ${address_src_1} ${address_src_2}`
		case "sb":case "sh":case "sw":
			if(!isValidLength(phrases, [3], `${phrases[0]} 'register' 'immidiate | immidiate(register)'`)) break;
			var address_1:number|undefined;
			if((address_1=isValidRegister(phrases[1]))===undefined) break;

			var address_2:number|undefined;
			if(!(address_2=isValidNpR(phrases[2]))) break;

			return `${phrases[0]} ${address_1} ${address_2}`
		case "mv":
			if(!isValidLength(phrases, [3], `${phrases[0]} 'register' 'register'`)) break;
			var address_1:number|undefined;
			if((address_1=isValidRegister(phrases[1]))===undefined) break;

			var address_2:number|undefined;
			if((address_2=isValidRegister(phrases[2]))===undefined) break;

			return `${phrases[0]} ${address_1} ${address_2}`
		case "jal":
			var entered_format;
			if(!(entered_format = isValidLength(phrases, [2,3], `${phrases[0]} ('register') 'label'`))) break;
			var label_nth = 1;
			if(entered_format == 2){
				var address_1:number|undefined;
				if((address_1=isValidRegister(phrases[1]))===undefined) break;
				label_nth = 2;
			}
			
			var label:number | undefined;
			if((label=isValidLabel(phrases[label_nth]))===undefined) break;
			
			return `${phrases[0]} ${address_1} ${label}`
		case "j":
			if(!isValidLength(phrases, [2], `${phrases[0]} 'label'`)) break;
				
			var label:number|undefined;
			if((label=isValidLabel(phrases[1]))===undefined) break;

			return `${phrases[0]} ${label}`
		case "jr":
			if(!isValidLength(phrases, [2], `${phrases[0]} 'register'`)) break;

			var address_1:number|undefined;
			if((address_1=isValidRegister(phrases[1]))===undefined) break;
			return `jal ${0} ${toNumber(register, address_1, 32, false)}`;

		case "beq":case "bne":case "bge":case "bgeu":case "bgt":case "bgtu":case "ble":case "bleu":case "blt":case "bltu":
			if(!isValidLength(phrases, [4], `${phrases[0]} 'register' 'register | immidiate' 'label'`)) break;

			var address_1:number|undefined;
			if((address_1=isValidRegister(phrases[1]))===undefined) break;
			var address_2:number|undefined;
			if((address_2=isValidRegister(phrases[2]))===undefined) break;
			var label:number|undefined;
			if((label=isValidLabel(phrases[3]))===undefined) break;

			return `${phrases[0]} ${address_1} ${address_2} ${label}`
		default:
			if(phrases[0].match(/:$/)){
				console.log(`labeled:${phrases[0]}`)
				break;
			}
			errorMsg(0, [phrases[0]])
			console.log(phrases)
		}
		return "";
	})
	if(error!==""){
		return {content:code, error:error}
	}
	setCommands(c=>[...c, ...compiled]);
	setLabels([...temp_labels]);
	return {content:code, error:"none"}
}