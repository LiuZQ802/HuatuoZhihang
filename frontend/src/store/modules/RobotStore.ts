// @ts-ignore
import type {Module} from 'vuex';

export default {
    namespaced: true,
    state: {
        showBubble:false,
        bubbleText:'',
        bubbleClass:'',
        isReady:false,
        bubbleTimer:null,
        avatarContainer:null,
    },
    getters: {
    },
    mutations: {
        // @ts-ignore
        setShowBubble(state,showBubble){
            state.showBubble=showBubble
        },
        // @ts-ignore
        setBubbleText(state,bubbleText){
            state.bubbleText=bubbleText
        },
        // @ts-ignore
        setBubbleClass(state,bubbleClass){
            state.bubbleClass=bubbleClass
        },
        // @ts-ignore
        setIsReady(state,isReady){
            state.isReady=isReady
        },
        // @ts-ignore
        setBubbleTimer(state,bubbleTimer){
            state.bubbleTimer=bubbleTimer
        },
        // @ts-ignore
        setAvatarContainer(state,avatarContainer){
            state.avatarContainer=avatarContainer
        }
    },

    actions: {
         // @ts-ignore
        speak({ state,commit },payload:{text, duration, type}){
            if (!state.isReady) return

            // 清除之前的定时器
            if (state.bubbleTimer) {
              clearTimeout(state.bubbleTimer)
            }

             // 设置气泡样式
            commit('setBubbleClass',payload.type)
            commit('setShowBubble',true)

            // 显示对话气泡
            commit('setBubbleText',payload.text)
            commit('setShowBubble',true)

            // 设置隐藏气泡的定时器 (duration为0表示一直显示)
            if (payload.duration > 0) {
                state.bubbleTimer = setTimeout(() => {
                    commit('setShowBubble',false)
                }, payload.duration)
            }
        },
        // @ts-ignore
        setMood({state},mood){
                if (!state.isReady.value) return

                const container = state.avatarContainer
                if (!container) return

                // 移除之前的表情类
                container.classList.remove('happy', 'excited', 'thinking', 'sleeping')

                // 添加新的表情类
                if (mood && mood !== 'neutral') {
                  container.classList.add(mood)
                }

                console.log(`🤖 设置表情: ${mood}`)
        },
        // @ts-ignore
        playGesture({state},gesture){
            if (state.isReady) return

            const container = state.avatarContainer
            if (!container) return

            // 添加手势动画类
            container.classList.add(`gesture-${gesture}`)

            // 1秒后移除动画类
            setTimeout(() => {
              container.classList.remove(`gesture-${gesture}`)
             }, 1000)

            console.log(`🤖 执行手势: ${gesture}`)
        },
        // @ts-ignore
        hideBubble({state}){
            state.showBubble = false
            if (state.bubbleTimer) {
               clearTimeout(state.bubbleTimer)
            }
        }
    },
}as Module<any, any>