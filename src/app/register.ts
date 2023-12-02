export interface Register{
  	reg_names: Array<{name:string, value:number}>

	memories: Array<boolean>
	used_memories: Array<{start:number, length:number}>

	delta: Array<number>
}
export const init = ():Register =>{
	const memories=Array<boolean>(4096).fill(false);
	const reg_names=[...Array(32)].map((v,i)=>{
		const value = i * 32;
		if(i >= 0 && i < 5)
			switch(i){
			case 0: return {name:"zero", value:value};
			case 1: return {name:"ra", value:value};
			case 2: return {name:"sp", value:value};
			case 3: return {name:"gp", value:value};
			default: return {name:"tp", value:value};
			}
		else if(i < 8)
			return {name:`t${i-5}`, value:value}
		else if(i < 10)
			return {name:`s${i-8}`, value:value}
		else if(i < 18)
			return {name:`a${i-10}`, value:value}
		else if(i < 28)
			return {name:`s${i-16}`, value:value}
		else
			return {name:`t${i-25}`, value:value}
	})
	return {reg_names:reg_names, memories:memories, used_memories:[], delta:[]}
}

export const n2m = (register:Register, reg_name:string) =>{
	const reg = register.reg_names.find(e=>e.name===reg_name);
	if(!reg) return -1;
	return reg.value;
}
/*
00000000
-100
+128
28
*/
export const resetDelta = (register:Register) =>{register.delta = []}
export const setMemory = (register:Register, value:number, address:number, length:number) =>{
	if(address<32) return;
	var counter = length;
	var binaly = "";

	register.delta.push(Math.floor(address/32));

	if(value < 0){
		--counter;
		for(;value < -Math.pow(2, counter);++counter){
			console.log(`${Math.pow(2, counter)}:${value}`);
		}
		value += Math.pow(2, counter);
		register.memories[address+length-1] = true;
		console.log(`neg:${value}`);
		counter = --length;
	}
	for(;value >= Math.pow(2, counter);++counter);
	for(var i = counter-1;i >= 0;--i){
		var n = Math.pow(2,i);
		if(Math.floor(value/n)===0){
			binaly += "0";
		}
		else{
			binaly += "1";
			value -= n;
		}
	}
	for(var i = 0;i < length;++i){
		register.memories[address+i] = binaly[binaly.length-i-1]==="1";
	}
}
export const copyMemory = (register: Register, src: number, dist: number, length: number) =>{
	register.delta.push(Math.floor(dist/32));
	
	for(var i = 0;i < length;++i){
		register.memories[dist+i] = register.memories[src+i];
	}
}
export const malloc = (register: Register, address: number, bytes: number) =>{
	var current_address = 1024;
	for(;current_address < 4096;++current_address){
		
	}
}

export const toHex = (register:Register, address:number, length:number): string =>{
	var hex = "";
	var i = 0;
	for(;i < length;i+=4){
    hex = toNumber(register, address+i, 4, false).toString(16) + hex;
  }
	if(i === length) return hex;

	console.log(`${length}:${i}`)

	return toNumber(register, address+i, length-i, false) + hex;
}
export const toNumber = (register:Register, address:number, length:number, isNegative:boolean): number =>{
	var n = 0;
	for(var i = 0;i < length;++i){
		if(isNegative && i === length-1){
			n -= register.memories[address+i]?Math.pow(2, i):0;
			break;
		}
		n += register.memories[address+i]?Math.pow(2, i):0;
	}
	return n;
}
export const toBinaly = (register:Register, address:number, length:number): string =>{
	var binaly = "";
	for(var i = 0;i < length;++i){
    binaly = (register.memories[address+i]?"1":"0") + binaly;
  }
  return binaly;
}

export const create = (register: Register):Register =>({
	reg_names:register.reg_names, 
	memories: register.memories, 
	used_memories:register.used_memories, 
	delta:register.delta
})