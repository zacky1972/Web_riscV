import React from "react";
import { Register, copyMemory, n2m, setMemory, toNumber } from "./register";

export const processCommand = (
	cmd: Array<string>, pc: number, register: Register, 
	setCommands: React.Dispatch<React.SetStateAction<Array<Msg>>>, setPC: React.Dispatch<React.SetStateAction<number>>
) => {
	var response = true;
	var target_address:number|undefined;

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
    }
		response = false;
    setCommands(c=>[...c, {content:msg, type:"err"}])
  }

	const isValidLength = (phrases: Array<string>, len: number, format:string) =>{
		if(phrases.length == len) return true;

		errorMsg(3, [format])
		return false;
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
			if(!isValidLength(mini_ph, 2, "immidiate or immidiate(register)")) return undefined;
			// console.log("pass0")//D
			if((value=isValidNumber(mini_ph[0]))===undefined || (address=isValidRegister(mini_ph[1]))===undefined)return undefined;

			// console.log(`pass1:${address}`)//D

			value += toNumber(register, address, 32, false);
		}
		return value;
	}
	const isValidLabel = (label:string) =>{
		var address:number|undefined;
		for(var i = cmd.length-1;i >= 0;--i){
			if(cmd[i]===(label+":")){
				address = i;
				break;
			}
		}
		if(address===undefined){
			errorMsg(4, [label]);
		}
		return address;
	}
	console.log(pc + "↓")
	console.log(cmd)
  const phrases = cmd[pc].split(" ").filter(e=>e);

  switch(phrases[0]){
	case "li":
    if(!isValidLength(phrases, 3, "li 'register' 'immediate'")) break;
    var address:number|undefined;
    if((address=isValidRegister(phrases[1]))===undefined) break;
		
    var value:number|undefined;
    if((value=isValidNumber(phrases[2]))===undefined) break;

    setMemory(register, value, address, 32);
    break;
	case "lb":case "lbu": case "lh": case "lhu": case "lw":
		if(!isValidLength(phrases, 3, `${phrases[0]} 'register' 'immidiate | immidiate(register)'`)) break;
    var address_1:number|undefined;
    if((address_1=isValidRegister(phrases[1]))===undefined) break;

		var address_2:number|undefined;
    if(!(address_2=isValidNpR(phrases[2]))) break;
		console.log(`address:${address_2}`);//D
		switch(phrases[0]){
		case "lb":
			var val = toNumber(register, address_2, 8, true);
			console.log(`val:${val}`);
			setMemory(register, val, address_1, 32);
			break;
		case "lbu":
			var val = toNumber(register, address_2, 8, false);
    	setMemory(register, val, address_1, 32);
			break;
		case "lh":
			var val = toNumber(register, address_2, 16, true);
			console.log(`val:${val}`);
			setMemory(register, val, address_1, 32);
			break;
		case "lhu":
			var val = toNumber(register, address_2, 16, false);
    	setMemory(register, val, address_1, 32);
			break;
		case "lw":
			copyMemory(register, address_2, address_1, 32);
		}
		break;
	case "addi": case "subi":
		if(!isValidLength(phrases, 4, `${phrases[0]} 'register' 'register' 'immediate'`)) break;
    var address_dist:number|undefined;
    if((address_dist=isValidRegister(phrases[1]))===undefined) break;

		var address_src:number|undefined;
    if((address_src=isValidRegister(phrases[2]))===undefined) break;
		var value_1 = toNumber(register, address_src, 32, true);
		
    var value_2:number|undefined;
    if((value_2=isValidNumber(phrases[3]))===undefined) break;
		switch(phrases[0]){
		case "addi":
			setMemory(register, value_1+value_2, address_dist, 32);
			break;
		case "subi":
			setMemory(register, value_1-value_2, address_dist, 32);
			break;
		}
		break;
	case "add": case "sub":
		if(!isValidLength(phrases, 4, `${phrases[0]} 'register' 'register' 'immediate'`)) break;
    var address_dist:number|undefined;
    if((address_dist=isValidRegister(phrases[1]))===undefined) break;

		var address_src_1:number|undefined;
    if((address_src_1=isValidRegister(phrases[2]))===undefined) break;
		var value_1 = toNumber(register, address_src_1, 32, true);
		
    var address_src_2:number|undefined;
    if((address_src_2=isValidRegister(phrases[3]))===undefined) break;
		var v_2 = toNumber(register, address_src_2, 32, true);
		switch(phrases[0]){
		case "add":
			setMemory(register, value_1+v_2, address_dist, 32);
			break;
		case "sub":
			setMemory(register, value_1-v_2, address_dist, 32);
			break;
		}
		break;
	case "sb":case "sh":case "sw":
		if(!isValidLength(phrases, 3, `${phrases[0]} 'register' 'immidiate | immidiate(register)'`)) break;
    var address_1:number|undefined;
    if((address_1=isValidRegister(phrases[1]))===undefined) break;

		var address_2:number|undefined;
    if(!(address_2=isValidNpR(phrases[2]))) break;
		switch(phrases[0]){
		case "sb":
			setMemory(register, toNumber(register, address_1, 8, false), address_2, 32);
			break;
		case "sh":
			setMemory(register, toNumber(register, address_1, 16, false), address_2, 32);
			break;
		case "sw":
			setMemory(register, toNumber(register, address_1, 32, false), address_2, 32);
			break;
		}
		break;
	case "mv":
		if(!isValidLength(phrases, 3, `${phrases[0]} 'register' 'register'`)) break;
    var address_1:number|undefined;
    if((address_1=isValidRegister(phrases[1]))===undefined) break;

		var address_2:number|undefined;
    if((address_2=isValidRegister(phrases[2]))===undefined) break;

		copyMemory(register, address_2, address_1, 32);
		break;
	case "jal":
		var v:number|undefined;
		if((v=isValidRegister("ra"))!==undefined)
			setMemory(register, pc, v, 32);
	case "j":
		if(!isValidLength(phrases, 2, `${phrases[0]} 'label'`)) break;
		
		var address:number|undefined;
		if((address=isValidLabel(phrases[1]))===undefined) break;

		target_address=address;
		break;
	case "beq":case "bne":case "bge":case "bgeu":case "bgt":case "bgtu":case "ble":case "bleu":case "blt":case "bltu":
		if(!isValidLength(phrases, 4, `${phrases[0]} 'register' 'register | immidiate' 'label'`)) break;

		var address_1:number|undefined;
    if((address_1=isValidRegister(phrases[1]))===undefined) break;
		var address_2:number|undefined;
    if((address_2=isValidRegister(phrases[2]))===undefined) break;
		var label:number|undefined;
		if((label=isValidLabel(phrases[3]))===undefined) break;

		const val_1 = toNumber(register, address_1, 32, !phrases[0].match(/u$/));
		const val_2 = toNumber(register, address_2, 32, !phrases[0].match(/u$/));
		switch(phrases[0]){
		case "beq":
			if(val_1 === val_2) target_address=label;
			break;
		case "bne":
			if(val_1 !== val_2) target_address=label;
			break;
		case "bge":case "bgeu":
			if(val_1 >= val_2) target_address=label;
			break;
		case "bgt":case "bgtu":
			if(val_1 > val_2) target_address=label;
			break;
		case "ble":case "bleu":
			if(val_1 <= val_2) target_address=label;
			break;
		case "blt":case "bltu":
			if(val_1 < val_2) target_address=label;
			break;
		}
		break;
	default:
		if(phrases[0].match(/:$/)){
			console.log(`labeled:${phrases[0]}`)
			break;
		}
    errorMsg(0, [phrases[0]])
    console.log(phrases)
  }
	if(response){
		setCommands(cmds => [...cmds, {content:cmd[pc], type:"cmd"}]);
		setPC(p=>p+1);
	}
	else{
		setCommands(cmds => [...cmds, {content:cmd[pc], type:"wrong"}]);
	}
	if(target_address!==undefined) processCommand(cmd, target_address, register, setCommands, setPC);

	if(pc < cmd.length-1){
		processCommand(cmd, pc+1, register, setCommands, setPC);
	}
	return response;
}

export const compile = (
	cmd: Array<string>, pc: number, register: Register,
):Array<Msg>=>{
	const penddingLabels = [];
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
    return {content:msg, type:"err"}
  }

	const isValidLength = (phrases: Array<string>, len: number, format:string) =>{
		if(phrases.length == len) return true;

		errorMsg(3, [format])
		return false;
	}
	const isValidRegister = (name:string) =>{
		if(n2m(register, name)!==-1) return true;
    errorMsg(2, [name])
    return false;
	}
	const isValidNumber = (n:string) =>{
		const value = Number(n)
		if(value || value===0) return true;

    errorMsg(1, [n])
		return false;
	}
	const isValidNpR = (arg:string) =>{
		var value:number|undefined;
		if(!(Number(arg))) {
			const mini_ph = arg.split(/\(|\)/).filter(e=>e);
			var address:number|undefined;
			if(!isValidLength(mini_ph, 2, "immidiate or immidiate(register)")) return false;
			// console.log("pass0")//D
			if(isValidNumber(mini_ph[0]) || isValidRegister(mini_ph[1]))return false;

			// console.log(`pass1:${address}`)//D
		}
		return true;
	}
	const isValidLabel = (label:string) =>{
		var address:number|undefined;
		for(var i = cmd.length-1;i >= 0;--i){
			if(cmd[i]===(label+":")){
				address = i;
				break;
			}
		}
		if(address===undefined){
			errorMsg(4, [label]);
			return false
		}
		return true;
	}
	return cmd.map(c=>{
		return {content:"", type:"cmd"}
	})
}