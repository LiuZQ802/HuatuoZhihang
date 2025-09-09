// @ts-ignore
import type {Module} from 'vuex';
export default {
    namespaced: true,
    state: {
        currentIdentity:null,//当前身份
        currentMedicalHistory:'',//当前病史
        identityOptions :null,
        info:null,
        tableColumns:[
            { title: '时间', key: 'time' ,align: 'center'},
            { title: '描述', key: 'info' ,align: 'center'},
        ],
    },
    getters: {
    },
    mutations: {
        setCurrentIdentity(state:any,currentIdentity:any){
            state.currentIdentity=currentIdentity
        },
        setCurrentMedicalHistory(state:any,currentMedicalHistory:any){
            state.currentMedicalHistory=currentMedicalHistory
        }

    },
    actions: {
        addCase({state,commit},{time,info}){
            console.log(state.currentIdentity)
            console.log(123)
            if(!state.currentIdentity)return
            const identity = state.currentIdentity
            const originalHistory = state.info[identity].history || []
            const newHistory = [...originalHistory, { time, info }]
            state.info[identity] = {
              ...state.info[identity],
              history: newHistory
            }
        }
    },
}as Module<any, any>