<template>
  <div class="chat-messages" ref="chatContainer">
    <huatuoMessage @messages="messages" @isReady="isReady"/>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import  huatuoMessage from "huatuozn"
import { getCurrentDateTime } from '@/utils/getCurrentTime'


const store = useStore()
const chatContainer = ref<HTMLElement>()

const currentSession = computed(() => store.getters['MapQAStore/currentSession'])
const messages = computed(() => currentSession.value?.messages ?? [])
const isReady=computed(()=>store.state.RobotStore.isReady)

onMounted(() => {
  store.commit('MapQAStore/createSession')
  store.commit('UserProfileStore/setCurrentIdentity',null)
  const session = store.getters['MapQAStore/currentSession']
  /**嗨～我是珞珈时空计算智能问答小助手！\n' +
        '有什么地理空间数据想查的，尽管问我吧，我来帮你写 SQL～✨*/
  session.messages.push({
    role: 'assistant',
    content: '♡ 嗨～欢迎来到医疗智航问答系统 🏥✨\n' +
         '我是你的地理空间 SQL 小助手 —— 珞小珈 💻🌍\n' +
         '无论是查询数据、定位医院，还是智能问诊，我都可以帮你！\n' +
         '请告诉我你想了解的内容，我这就开始为你处理啦～❤',
    type: 'normal',
    time: getCurrentDateTime()
  })
})

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}, { deep: true })




</script>

<style scoped>
/* 隐藏滚动条但保持滚动功能 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px 16px 0;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.chat-messages::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>