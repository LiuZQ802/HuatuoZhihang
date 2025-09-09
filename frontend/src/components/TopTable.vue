<template>
      <div class="vis-header" v-show="!isPanelCollapsed">
          <div class="view-tabs">
            <div
              v-for="tab in viewTabs"
              :key="tab.value"
              :class="['view-tab', { active: viewMode === tab.value }]"
              @click="viewMode = tab.value"
            >
              <n-icon size="16">
                  <component :is="tab.icon" />
              </n-icon>
              <span class="tab-label">{{ tab.label }}</span>
            </div>
          </div>
        </div>
    <div class="data-section" :style="{ height: topPanelHeight + 'px' }">
         <Table v-if="viewMode === 'table'"/>
         <Reocords v-else-if="viewMode === 'records'"/>
    </div>
</template>

<script setup lang="ts">
import Table from "@/components/Table.vue";
import Reocords from "@/components/Reocords.vue"
import {computed} from "vue";
import {useStore} from "vuex";
import {
  Table as TableIcon,
  History as HistoryIcon
} from 'lucide-vue-next'
/** 属性*/
const store = useStore()

const topPanelHeight = computed({
  get: () => store.state.ChatConfigStore.topPanelHeight,
  set: (val) => {
    store.state.ChatConfigStore.topPanelHeight = val;
  }
});
const isPanelCollapsed=computed(()=>store.state.ChatConfigStore.isPanelCollapsed)
const viewMode=computed({
  get: () => store.state.ChatConfigStore.viewMode,
  set: (val) => {
    store.state.ChatConfigStore.viewMode= val;
  }
});
// 添加视图标签数据
const viewTabs = [
  { value: 'table', label: '表格', icon: TableIcon },
  { value: 'records', label: '病历', icon: HistoryIcon },
]





</script>

<style scoped>
/* 数据表格区域 */
.data-section {
  background: white;
  display: flex;
  flex-direction: column;
  padding: 10px 20px 10px 20px;
  overflow: hidden;
  transition: height 0.3s ease;
  border-radius: 12px;
  margin: 5px 16px 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  /* 重要：限制最大宽度，防止被撑开 */
  max-width: 100%;
  box-sizing: border-box;
}
.vis-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 30px;
  margin-top: 5px;
  margin-bottom: 5px;
  margin-left: 10px;
}

.view-tabs {
  display: flex;
  gap: 4px;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 10px;
  height: 100%;
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6B7280;
  font-size: 13px;
  font-weight: 500;
  user-select: none;
  background: transparent;
}

.view-tab:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #4B5563;
}

.view-tab.active {
  background: #115740;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-tab .n-icon {
  transition: transform 0.2s;
}

.view-tab:hover .n-icon {
  transform: translateY(-1px);
}

.view-tab.active .n-icon {
  color: white;
}
.tab-label {
  white-space: nowrap;
}

.vis-header :deep(.n-radio-button:hover:not(.n-radio-button--checked)) {
  border-color: #DDD6FE;
  background: #F9FAFB;
}

/* 确保图标和文字在选中状态下都是白色 */
.vis-header :deep(.n-radio-button.n-radio-button--checked .n-icon) {
  color: white !important;
}

.vis-header :deep(.n-radio-button.n-radio-button--checked .radio-label) {
  color: white !important;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .data-section {
    height: auto !important;
    min-height: 200px;
    margin: 8px;
    padding: 12px;
  }

  .header-title h3 {
    font-size: 14px;
  }

  .table-wrapper :deep(.n-data-table-td),
  .table-wrapper :deep(.n-data-table-th) {
    padding: 6px 8px;
    font-size: 11px;
  }
}

</style>