<template>
  <div class="input-container">
      <huatuoChat @send="send" @isReady="isReady"/>
  </div>


</template>

<script setup lang="ts">
import  huatuoChat from "huatuozn"
import {useStore} from "vuex";
import {useMessage} from "naive-ui";
import {getCurrentDateTime} from "@/utils/getCurrentTime.ts";
import { ref, computed, watch, onMounted } from 'vue'
const isReady=computed(()=>store.state.RobotStore.isReady)

/** 属性*/
const store = useStore()
const message = useMessage()
const tzLabel = ref('')  // 提示用：显示当前时区
// 配置：是否边说边出文字、结束后是否自动发送
const question = computed({
  get: () => store.state.MapQAStore.question,
  set: (val) => store.commit('MapQAStore/setQuestion', val)
})

const currentTime = ref('')
let clockTimer: number | null = null

const previewImageName=computed(()=>store.state.MapQAStore.previewImageName)


const currentSession = computed(() => store.getters['MapQAStore/currentSession'])
const isThinking = computed(() => currentSession.value?.isThinking)



// 初始化机器人
onMounted(() => {
  tzLabel.value = Intl.DateTimeFormat().resolvedOptions().timeZone
  updateTime()
  clockTimer = window.setInterval(updateTime, 1000)
  setTimeout(() => {
    if (isReady.value) {
      const greeting = robotGreetings[Math.floor(Math.random() * robotGreetings.length)]
      store.dispatch('RobotStore/speak',{text:greeting,duration:3000,type:'happy'})
      store.dispatch('RobotStore/setMood','happy')
    }
  }, 500)
})

onBeforeUnmount(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
})

// 监听思考状态变化
watch(isThinking, (newVal, oldVal) => {
  if (!isReady.value) return
  if (newVal && !oldVal) {
    // 开始思考
    store.dispatch('RobotStore/speak',{text:'正在思考中...',duration:0,type:'thinking'})
    store.dispatch('RobotStore/setMood','thinking')
  } else if (!newVal && oldVal) {
    // 思考结束
    store.dispatch('RobotStore/hideBubble')
    store.dispatch('RobotStore/speak',{text:'完成了！',duration:2000,type:'happy'})
    store.dispatch('RobotStore/setMood','happy')
    setTimeout(() => {
      store.dispatch('RobotStore/setMood','neutral')
    }, 2000)
  }
}, { immediate: true })

// 监听问题变化
watch(question, (newVal) => {
  if (!isReady.value) return

  if (newVal.trim() && !isThinking.value) {
    // 用户开始输入
      store.dispatch('RobotStore/setMood','happy')
  }
})

/**   方法 */

const send = () => {
  if (isThinking.value) return
  const process_question = question.value.trim()
  if (!process_question) return

  // 机器人响应发送
  if (isReady.value) {
      store.dispatch('RobotStore/speak',{text:'好的，让我来处理！',duration:1500,type:'excited'})
      store.dispatch('RobotStore/playGesture','nod')
  }

  // 如果没有创建对话那么则默认创建一个新对话
  if (!currentSession.value) {
    store.commit('MapQAStore/createSession')
  }

  // 添加用户问题
  if(!previewImageName.value){
      currentSession.value.messages.push({
        role: 'user',
        content: process_question,
        type: 'ask',
        time: getCurrentDateTime()
      })
  }


  const currentSessionIdBeforeSend = currentSession.value.id;

  try {
    controller.value = new AbortController()
    store.dispatch('MapConfigStore/setLatLon',{latitude:30.499081,longitude:114.411034})
    store.dispatch('MapQAStore/send')
  } catch (err) {
    if (err && err.code != '"ERR_CANCELED"') {
      message.error('请求失败：' + err)
      const placeholder = reactive({role: 'assistant', content: '...', type: 'wait', res_type: 'SQLGen',time: ''})
      currentSession.value.messages.push(placeholder)
      store.commit('MapQAStore/setIsActivePlaceholder', {
        id: currentSessionIdBeforeSend,
        value: placeholder
      });
      store.dispatch('MapQAStore/handleError',{message:'发生错误，无法获取回答，请稍后再试。', placeholder,eventSource:null})

      // 机器人响应错误
      if (isReady.value) {
        store.dispatch('RobotStore/speak',{text:'抱歉，出现了错误',duration:3000,type:'normal'})
        store.dispatch('RobotStore/setMood','neutral')
      }
    }
  }
}

const updateTime = () => {
  // 24 小时制，YYYY/MM/DD HH:mm:ss
  currentTime.value = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(new Date())
}



</script>

<style scoped>
.input-container {
  width: 100%;
  margin-bottom: 10px;
}
</style>