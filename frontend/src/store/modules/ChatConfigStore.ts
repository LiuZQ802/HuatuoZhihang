// @ts-ignore
import type {Module} from 'vuex';
export default {
    namespaced: true,
    state: {
        modelList: [],
        currentModel: null,
        databaseList:[],
        currentDatabase: {},
        isPanelCollapsed:false,
        viewMode:'table',
        topPanelHeight:200,
        latitude:'',
        longitude:'',
    },
    getters: {
    },
    mutations: {
        setModelList(state:any, modelList:any) {
            state.modelList = modelList
        },
        setCurrentModel(state:any, currentModel:any) {
            state.currentModel = currentModel
        },
        setDatabaseList(state:any, databaseList:any) {
            state.databaseList = databaseList
        },
        setCurrentDatabase(state:any, currentDatabase:any) {
            state.currentDatabase = currentDatabase
        },
        setViewMode(state:any,viewMode:any){
            state.viewMode=viewMode
        },
        setLatitude(state:any,latitude:number){
            state.latitude=latitude
        },
        setLongitude(state:any,longitude:number){
            state.longitude=longitude
        },

    },
    actions: {},
}as Module<any, any>