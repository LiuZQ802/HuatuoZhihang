<template>
  <div class="visualization-section">
        <div class="vis-content">
          <Map/>
        </div>
  </div>
</template>
<script setup lang="ts">
import Map from '@/components/Map.vue'
import {useStore} from "vuex";

/** 属性*/
const store=useStore()


</script>

<style scoped>
/* 可视化区域 */
.visualization-section {
  flex: 1;
  padding: 0 16px 5px 16px;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 400px;
}
/* 左侧面板收缩时调整 */
.panel-collapsed .visualization-section {
  padding: 20px; /* 增加内边距 */
}

</style>