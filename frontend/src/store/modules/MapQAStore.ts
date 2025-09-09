// @ts-ignore
import type {Module} from 'vuex';
import {getCurrentDateTime} from "@/utils/getCurrentTime.ts";
import {getSQLData, multiRounds, getFigure, reSend, getFigureField, sendSelectApi, return_sick_summary} from "@/api";
import {getCurrentLocation} from "@/utils/getCurrentLocation.ts";
interface Session {
  id: number
  title: string
  messages: Message[],
}
interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default {
    namespaced: true,
    state: {
        sessions: [],  //对话条目
        currentSessionId: null,  //当前对话条目
        question:'',//用户输入的问题
        controller:'',//请求信号
        tableColumns:[
            { title: '区域', key: 'district' ,align: 'center'},
            { title: '平均流量', key: 'avg_flow' ,align: 'center'},
            { title: '峰值流量', key: 'peak_flow',align: 'center' },
            { title: '同比', key: 'growth',align: 'center' },
            { title: '更新时间', key: 'update_time' ,align: 'center'}
        ],//表头
        tableData:[
            { district: '朝阳区', avg_flow: '125,420', peak_flow: '198,350', growth: '+12.5%', update_time: '2024-01-20 10:00' },
            { district: '海淀区', avg_flow: '118,200', peak_flow: '176,890', growth: '+8.3%', update_time: '2024-01-20 10:00' },
            { district: '东城区', avg_flow: '98,560', peak_flow: '145,230', growth: '+15.2%', update_time: '2024-01-20 10:00' },
            { district: '西城区', avg_flow: '92,180', peak_flow: '138,460', growth: '+6.7%', update_time: '2024-01-20 10:00' }
        ],//表数据
        dataNumber:4,
        figureColumns:[],
        figureDatas:[],
        figureState:null,
        mapData:null,
        isStream:false,
        llm_question:'',
        items:[],
        previewImage :ref<string | null>(null),
        previewImageName : ref<string | null>(null),
    },
    getters: {
        currentSession(state:any): Session | null {
            return state.sessions.find(s => s.id === state.currentSessionId) || null
        },
        figureData(state:any){
            const columns =state.figureColumns
            const data=state.figureDatas
            const formatted = data.map((row:any) => {
                const obj = {}
                columns.forEach((col:any, i:any) => {
                    obj[col] = row[i]
                })
                return obj
             })
            return {
                columns,
                formatted
            }
        },
    },
    mutations: {
        createSession(state:any){
            const id = Date.now()
            state.sessions.push({ id, title: `对话 ${state.sessions.length + 1}`, messages: [] ,isThinking: false ,activePlaceholder:null})
            state.currentSessionId = id
        },
        selectSession(state:any, id: number) {
            state.currentSessionId = id
        },
        deleteSession(state:any, id: number) {
            state.sessions = state.sessions.filter(s => s.id !== id)
            if (state.currentSessionId === id) {
              state.currentSessionId = state.sessions.length > 0 ? state.sessions[0].id : null
            }
        },
        setQuestion(state:any, value: string) {
            state.question = value
        },
        clearQuestion(state:any) {
            state.question = ''
        },
        setIsThinking(state:any, payload: { id: number; value: boolean }) {
            // @ts-ignore
            const session = state.sessions.find(s => s.id === payload.id);
            if (session) {
                session.isThinking = payload.value;
            }
        },
        setIsActivePlaceholder(state:any, payload: { id: number; value:any }){
            // @ts-ignore
            const session = state.sessions.find(s => s.id === payload.id);
            if (session) {
                session.activePlaceholder = payload.value;
            }
        },
        setData(state:any,payload:{tableColumns:any,tableData:any}){
            state.tableColumns=payload.tableColumns
            state.tableData=payload.tableData
            state.dataNumber=payload.tableData.length
        },
        setFigureData(state:any,payload:{columns:any,data:any}){
            state.figureColumns=payload.columns
            state.figureDatas=payload.data
        },
        setMapData(state:any,payload:{mapData:any}){
            state.mapData=payload.mapData
        },
        setIsStream(state:any,isStream:boolean){
          state.isStream=isStream
        },
        setLlm_question(state:any,llm_question:string){
          state.llm_question=llm_question
        },
        setItems(state:any,items:any){
          state.items=items
        },
        updateCurrentSessionMessages(state:any,messages:any){
            // @ts-ignore
            const currentSession=state.sessions.find(s => s.id === state.currentSessionId) || null
            if (currentSession) {
                currentSession.messages = messages
            }
        },

    },
    actions: {
        SetData({ commit,dispatch,rootState},res_data:any) {
            if('error' in res_data){
                const errorMsg = res_data.error
                const tableColumns = [{ title: '错误信息', key: 'error' ,align: 'center'}]
                const tableData = [{ error: errorMsg }]
                commit('setData', {
                    tableColumns,
                    tableData
                })
                return
            }
            const {columns, data}=res_data
            const tableColumns = columns.map((col:any) => ({
                title: col,
                key: col,
                align: 'center'
            }))
            const tableData = data.map((row:any) => {
                const rowObj: Record<string, any> = {}
                columns.forEach((col:any, index:any) => {
                    rowObj[col] = row[index]
                })
                return rowObj
            })
            let hospitalList=[]
            const colMap = Object.fromEntries(columns.map((col:any, i:any) => [col.toLowerCase(), i]))
            if('latitude' in colMap && 'longitude' in colMap){
                function getFieldByFuzzyKey(obj: Record<string, any>, keyword: string,mr:any) {
                        const lowerKeyword = keyword.toLowerCase()
                        const matchedKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKeyword)
                        return matchedKey ? obj[matchedKey] : mr
                }
                hospitalList = data.map((row: any[]) => {
                        const obj: Record<string, any> = {}
                        columns.forEach((col: string, index: number) => {
                          obj[col] = row[index]
                        })
                    console.log(columns)
                    console.log(row)
                    console.log(obj)
                        return {
                            id: obj['ID'] ?? '',
                            name: getFieldByFuzzyKey(obj, 'NAME',getFieldByFuzzyKey(obj, 'ENTERPRISE_NAME','')),
                            legal_entity_name:getFieldByFuzzyKey(obj, 'LEGAL_ENTITY_NAME',''),
                            address: getFieldByFuzzyKey(obj, 'ADDRESS','湖北省武汉市'),
                            district: getFieldByFuzzyKey(obj, 'DISTRICT',getFieldByFuzzyKey(obj, 'REGION_CODENAME','')),
                            longitude: Number(obj['LONGITUDE'])??Number('114.3550'),
                            latitude: Number(obj['LATITUDE'])??Number('30.5292'),
                            time:getFieldByFuzzyKey(obj, 'OPEN_TIME','8:00')+'--'+getFieldByFuzzyKey(obj, 'CLOSE_TIME','18:00')
                         }
                })
                commit('ChatConfigStore/setViewMode', 'table', { root: true })
            }else{
                commit('ChatConfigStore/setViewMode', 'table', { root: true })
            }
            commit('setData', {
                tableColumns,
                tableData
            })

            commit('setFigureData',{
                columns,
                data
            })

            if(hospitalList.length){
                commit('setMapData',{
                    mapData:hospitalList,
                })
            }
        },
        // @ts-ignore,发送请求
        async send({state,dispatch,getters,commit}){
            if(state.isStream){
                dispatch('send_SQL',question)
            }else{
                dispatch('send_Select')
            }
        },
        // @ts-ignore,发送请求-select
        async send_Select({commit,state,getters,dispatch,rootState},payload:any ={}){
            let { question, answer,items } = payload
            const currentSessionIdBeforeSend = getters.currentSession.id;
            //开始思考
            commit('setIsThinking', { id: currentSessionIdBeforeSend, value: true });
            // 添加AI思考
            let placeholder = reactive({role: 'assistant', content: '...', type: 'wait', res_type: 'select', question:'',items:'',time: ''})
            getters.currentSession.messages.push(placeholder)
            commit('setIsActivePlaceholder', {
                id: currentSessionIdBeforeSend,
                value: placeholder
            });
            if(!question){
                question=state.question.trim()
            }
            commit('clearQuestion')//清空输入框
            const cases=rootState.UserProfileStore.currentMedicalHistory
            sendSelectApi({question,answer,items,case:cases}).then((res:any)=>{
                const data=res.data
                console.log(data)
                const isCompleted=data.isCompleted
                commit('setIsStream',isCompleted)
                if(isCompleted){
                    dispatch('send_summary')
                }else{
                    commit('setLlm_question',data.question)
                    commit('setItems',data.items)
                    if (placeholder.type === 'wait') {
                        placeholder.type = 'answer';
                    }
                    placeholder.question=data.question
                    placeholder.items=data.items
                    console.log(placeholder)
                    commit('setIsThinking', { id: currentSessionIdBeforeSend, value: false });
                    commit('setIsActivePlaceholder', { id: currentSessionIdBeforeSend, value: null });

                }
            }).catch((error:any)=>{
                console.log(error)
                dispatch('handleError',{message:'连接错误，请稍后再试。', placeholder, eventSource:''})
            })

        },
        // @ts-ignore,发送请求-SQL
        async send_SQL({commit,state,getters,dispatch,rootState},question='') {
            let placeholder:any
            const currentSessionIdBeforeSend = getters.currentSession.id;
            //开始思考
            commit('setIsThinking', { id: currentSessionIdBeforeSend, value: true });
            // 添加AI思考
            placeholder = reactive({role: 'assistant', content: '...', type: 'wait', res_type: 'SQLGen',time: ''})
            getters.currentSession.messages.push(placeholder)
            commit('setIsActivePlaceholder', {
                id: currentSessionIdBeforeSend,
                value: placeholder
            });


            let longitude=rootState.ChatConfigStore.longitude;
            let latitude =rootState.ChatConfigStore.latitude;
            if(!latitude || !longitude){
                const position = await getCurrentLocation();
                latitude=position.lat
                longitude=position.lng
            }
            const currentTime=getCurrentDateTime()
            const eventSource = multiRounds({question: question,longitude,latitude,currentTime}, {
                // @ts-ignore
                signal: state.controller.signal,
            });
            commit('clearQuestion')//清空输入框

            eventSource.onopen = () => {
                console.log("SSE connection opened.");
            };
            eventSource.onmessage = (event: { data: string; }) => {
                if (!getters.currentSession.isThinking) {
                    eventSource.close();
                    console.log("SSE connection opened.");
                    return;
                }
                try {
                    const data = JSON.parse(event.data);
                    console.log(data)
                    switch (data.type) {
                        case 'think':
                            placeholder.content = data.content;
                            break;
                        case 'result':placeholder.res_type = data.current_step
                            if (placeholder.type === 'wait') {
                                placeholder.content = data.content;
                                placeholder.type = 'answer';
                            } else {
                                placeholder.content += data.content;
                            }
                        break;
                        case 'end':
                            eventSource.close();
                            console.log("SSE connection closed.");
                            commit('setIsStream',false);
                            dispatch('get_database_result',{question:question,llm_response:placeholder.content}) //获取数据
                            break;
                        case 'interrupt':
                            eventSource.close();
                            console.log("SSE connection closed.");
                            commit('setIsThinking', {id: currentSessionIdBeforeSend, value: false});
                            commit('setIsActivePlaceholder', {id: currentSessionIdBeforeSend, value: null});
                            break;
                        case 'error':
                            const content=data.content
                            dispatch('handleError', {content, placeholder, eventSource});
                            break;
                        case 'step_end':
                            placeholder.time = getCurrentDateTime()
                            const res_type = data.next_step
                            if (res_type != 'end') {

                            }
                        break;
                        default:// 没有 type，但有 content
                            if (data.content) {
                                placeholder.content += data.content;
                            }
                    }
                } catch (e) {
                    eventSource.close();
                    dispatch('handleError',{message:'发生错误，请稍后再试。', placeholder, eventSource})
                }
            }
            eventSource.onerror = (error:any) => {
                if (error && error.code != '"ERR_CANCELED"') {
                    console.log(error)
                    dispatch('handleError',{message:'连接错误，请稍后再试。', placeholder, eventSource})
                }
            }
        },
        // @ts-ignore
        async send_summary({commit,state,getters,dispatch}){
            let  placeholder=getters.currentSession.activePlaceholder
            console.log(placeholder)
            const currentSessionIdBeforeSend = getters.currentSession.id;
            //开始思考
            commit('setIsThinking', { id: currentSessionIdBeforeSend, value: true });
            // 添加AI思考

            const eventSource = return_sick_summary( {
                // @ts-ignore
                signal: state.controller.signal,
            });
            eventSource.onopen = () => {
                console.log("SSE connection opened.");
            };
            eventSource.onmessage = (event: { data: string; }) => {
                if (!getters.currentSession.isThinking) {
                    eventSource.close();
                    console.log("SSE connection opened.");
                    return;
                }
                try {
                    const data = JSON.parse(event.data);
                    console.log(data)
                    switch (data.type) {
                        case 'think':
                            placeholder.content = data.content;
                            break;
                        case 'result':
                            if (placeholder.type === 'wait') {
                                placeholder.content = data.content;
                                placeholder.type = 'answer';
                                placeholder.res_type = data.current_step
                                placeholder.time = getCurrentDateTime()
                            } else {
                                placeholder.content += data.content;
                            }
                        break;
                        case 'end':
                            eventSource.close();
                            console.log("SSE connection closed.");
                            // 添加病例
                            dispatch('UserProfileStore/addCase',{time:getCurrentDateTime(),info:placeholder.content},{root:true})
                            placeholder.content += '\n';
                            const text = '为了更清楚地观察症状，请上传病理照片。'
                            let index = 0

                            const timer = setInterval(() => {
                                if (index < text.length) {
                                    placeholder.content += text[index]
                                    console.log(placeholder.content)
                                    index++
                                } else {
                                    clearInterval(timer)
                                    console.log(placeholder.content)
                                }
                            }, 50)  // 打字间隔（毫秒）
                            commit('setIsThinking', { id: currentSessionIdBeforeSend, value: false });
                            commit('setIsActivePlaceholder', { id: currentSessionIdBeforeSend, value: null });

                            break;
                        case 'interrupt':
                            eventSource.close();
                            console.log("SSE connection closed.");
                            commit('setIsThinking', {id: currentSessionIdBeforeSend, value: false});
                            commit('setIsActivePlaceholder', {id: currentSessionIdBeforeSend, value: null});
                            break;
                        case 'error':
                            const content=data.content
                            dispatch('handleError', {content, placeholder, eventSource});
                            break;
                        case 'step_end':
                            const res_type = data.next_step
                            if (res_type != 'end') {
                            }
                        break;
                        default:// 没有 type，但有 content
                            if (data.content) {
                                placeholder.content += data.content;
                            }
                    }
                } catch (e) {
                    eventSource.close();
                    dispatch('handleError',{message:'发生错误，请稍后再试。', placeholder, eventSource})
                }
            }
            eventSource.onerror = (error:any) => {
                if (error && error.code != '"ERR_CANCELED"') {
                    console.log(error)
                    dispatch('handleError',{message:'连接错误，请稍后再试。', placeholder, eventSource})
                }
            }

        },
        async reSend({commit,state,getters,dispatch},{ controller,placeholder,index}){
            const question=placeholder.content
            const messages=getters.currentSession?.messages
            if (!messages || !Array.isArray(messages)) return
            const newMessages = messages.slice(0, index + 1)
            commit('updateCurrentSessionMessages', newMessages)
            placeholder = reactive({role: 'assistant', content: '...', type: 'wait', res_type: 'insight', time: ''})
            getters.currentSession.messages.push(placeholder)
            const currentSessionIdBeforeSend = getters.currentSession.id;
            commit('setIsThinking', { id: currentSessionIdBeforeSend, value: true });
            commit('setIsActivePlaceholder', { id: currentSessionIdBeforeSend, value: placeholder });

            const eventSource = reSend({question: question.trim()}, {
                    // @ts-ignore
                    signal: controller.signal,
                });

            eventSource.onopen = () => {
                console.log("SSE connection opened.");
            };
            eventSource.onmessage = (event: { data: string; }) => {
                if (!getters.currentSession.isThinking) {
                    eventSource.close();
                    console.log("SSE connection opened.");
                    return;
                }
                try {
                    const data = JSON.parse(event.data);
                    console.log(data)
                    switch (data.type) {
                        case 'think':
                            placeholder.content = data.content;
                            break;
                        case 'result':placeholder.res_type = data.current_step
                            if (placeholder.type === 'wait') {
                                placeholder.content = data.content;
                                placeholder.type = 'answer';
                            } else {
                                placeholder.content += data.content;
                            }
                        break;
                        case 'end':
                            eventSource.close();
                            console.log("SSE connection closed.");
                            dispatch('get_database_result',{question:question.trim(),llm_response:placeholder.content}) //获取数据
                            break;
                        case 'interrupt':
                            eventSource.close();
                            console.log("SSE connection closed.");
                            commit('setIsThinking', {id: currentSessionIdBeforeSend, value: false});
                            commit('setIsActivePlaceholder', {id: currentSessionIdBeforeSend, value: null});
                            break;
                        case 'error':
                            dispatch('handleError',controller,data.content, placeholder, eventSource);
                            break;
                        case 'step_end':
                            placeholder.time = getCurrentDateTime()
                            const res_type = data.next_step
                            if (res_type != 'end') {
                                placeholder = reactive({
                                    role: 'assistant',
                                    content: '...',
                                    type: 'wait',
                                    res_type: res_type,
                                    time: ''
                                })
                                getters.currentSession.messages.push(placeholder)
                                commit('setIsActivePlaceholder', {
                                    id: currentSessionIdBeforeSend,
                                    value: placeholder
                                });
                            }
                        break;
                        default:// 没有 type，但有 content
                            if (data.content) {
                                placeholder.content += data.content;
                            }
                    }
                } catch (e) {
                    eventSource.close();
                    dispatch('handleError',{controller,message:'发生错误，请稍后再试。', placeholder, eventSource})
                }
            }
            eventSource.onerror = (error:any) => {
                if (error && error.code != '"ERR_CANCELED"') {
                    console.log(error)
                    dispatch('handleError',{controller,message:'连接错误，请稍后再试。', placeholder, eventSource})
                }
            }
            console.log(newMessages)
        },
        async get_database_result({commit,state,getters,dispatch},{question,llm_response}){
            console.log(llm_response)
            // @ts-ignore
            function removeEmptyColumns({columns,data}) {

                    const validIndexes = columns.map((_, colIdx) => {
                        // @ts-ignore
                        return data.some(row => {
                            const val = row[colIdx]
                            return val !== null && val !== '' && val !== undefined
                        })? colIdx : null

                    }).filter(idx => idx !== null)
                    // @ts-ignore 新 columns
                    const newColumns = validIndexes.map(idx => columns[idx])

                    // @ts-ignore 新 data
                    const newData = data.map(row => validIndexes.map(idx => row[idx]))

                    return { columns: newColumns, data: newData }
            }
            getSQLData({llm_response}).then((res:any)=>{
                const data=res.data
                console.log(data)
                if('error' in data)dispatch('SetData',data)
                else dispatch('SetData',removeEmptyColumns(data))
                const currentSession=getters.currentSession;
                const currentSessionIdBeforeSend = currentSession.id;

                commit('setIsThinking', { id: currentSessionIdBeforeSend, value: false });
                commit('setIsActivePlaceholder', { id: currentSessionIdBeforeSend, value: null });
            }).catch((error:any)=>{
                console.log(error)
            })
        },
        stopThinking({commit,getters,state}){
            const currentSession=getters.currentSession
            const activePlaceholder=currentSession?.activePlaceholder

            if (state.controller) state.controller.abort()
            if (currentSession.isThinking && activePlaceholder) {
                activePlaceholder.content = '已终止响应'
                activePlaceholder.type='normal'
                activePlaceholder.res_type='normal'
            }
            const currentSessionIdBeforeStop = currentSession.id;
            commit('setIsThinking', { id: currentSessionIdBeforeStop, value: false });
            commit('setIsActivePlaceholder', { id: currentSessionIdBeforeStop, value: null });
        },
        handleError({commit,getters,dispatch},{message,placeholder,eventSource}){
            if(getters.currentSession.isThinking){
                dispatch('stopThinking');
                placeholder.res_type='error'
                placeholder.type='error'
                placeholder.content = `${message}`;
                if(eventSource) eventSource.close();
            }
        },
    }
}as Module<any, any>