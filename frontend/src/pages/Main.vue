<template>
  <div class="geo-sql-system" :class="{ 'panel-collapsed': isPanelCollapsed }">
    <!-- 左侧查询面板 -->
    <LeftPanel/>
    <!-- 右侧内容区 -->
    <RightPanel/>
  </div>
</template>

<script setup lang="ts">
import LeftPanel from "@/components/LeftPanel.vue";
import RightPanel from "../components/RightPanel.vue";
import {useStore} from "vuex";

/** 属性*/
const store=useStore()
const isPanelCollapsed=computed(()=>store.state.ChatConfigStore.isPanelCollapsed)

// 状态管理

onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  // 清理
})
</script>

<style scoped>
</style>