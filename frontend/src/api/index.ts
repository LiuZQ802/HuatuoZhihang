import ajax from "./ajax";

const BASE_URL='http://localhost:8000/api'
export const getAllModels=(dts: {})=>ajax(`${BASE_URL}/allModels`,dts,'GET')

export const getCurrentModel=(dts:{})=>ajax(`${BASE_URL}/getCurrentModel`,dts,'GET')

export const setLMMModel=(dts:{modelName:string})=>ajax(`${BASE_URL}/setLMMModel`,dts,'POST')

export const getSQLData=(dts:{llm_response:string})=>ajax(`${BASE_URL}/getData`,dts,'POST')

export const multiRounds=(dts:{question:string,longitude:number,latitude:number,currentTime:string},signal?: AbortSignal)=>new EventSource(`${BASE_URL}/multiRounds?question=${encodeURIComponent(dts.question)}&longitude=${encodeURIComponent(dts.longitude)}&latitude=${encodeURIComponent(dts.latitude)}&currentTime=${encodeURIComponent(dts.currentTime)}`,{signal:signal})

export const reSend=(dts:{question:string},signal?: AbortSignal)=>new EventSource(`${BASE_URL}/reSend?question=${encodeURIComponent(dts.question)}`,{signal:signal})

export const sendSelectApi=(dts:{question:string,answer:string,items:string,case:string})=>ajax(`${BASE_URL}/getSelect`,dts,'POST')

export const return_sick_summary=(signal?: AbortSignal)=>new EventSource(`${BASE_URL}/return_sick_summary`,{signal:signal})