<template>
   <div class="section-header">
     <div class="header-title">
       <n-icon size="18" color="#115740">
         <medicalIcon />
       </n-icon>
       <h3 v-if="currentIdentity && info[currentIdentity]">
            {{ info[currentIdentity].name }}的病历
        </h3>
        <h3 v-else>
          请先选择就诊人身份
        </h3>
       <n-tag v-if="currentIdentity" type="success" size="small">{{ dataNumber }} 条</n-tag>
     </div>
   </div>
    <div class="table-wrapper" ref="tableWrapperRef">
          <n-data-table
            ref="tableRef"
            :columns="processedColumns"
            :data="tableData"
            :pagination="false"
            size="small"
            :single-line="false"
            striped
            virtual-scroll
            :scroll-x="scrollX"
            :max-height="maxTableHeight"
            :row-props="rowProps"
          />
        </div>
</template>

<script setup lang="ts">
import {useStore} from "vuex";
import {computed, onUnmounted, ref} from "vue";

const store =useStore()
const currentIdentity=computed(()=>store.state.UserProfileStore.currentIdentity)
const info=computed(()=>store.state.UserProfileStore.info)
const tableData = computed(() => {
  const identity = currentIdentity.value
  if (!identity || !info.value[identity]) return []
  return info.value[identity].history || []
})
const dataNumber=computed(()=>tableData.value.length)
const tableColumns = computed(() => store.state.UserProfileStore.tableColumns) //表头 gai
const topPanelHeight = computed({
  get: () => store.state.ChatConfigStore.topPanelHeight,
  set: (val) => {
    store.state.ChatConfigStore.topPanelHeight = val;
  }
});
// 处理列宽度
const processedColumns = computed(() => {
  if (!tableColumns.value) return []

  const columnCount = tableColumns.value.length
  const minWidth = 80 // 每列最小宽度
  const maxWidth = 100 // 每列最大宽度

  // 根据列数动态调整宽度
  let columnWidth = minWidth
  if (columnCount <= 5) {
    columnWidth = Math.max(containerWidth.value / columnCount, minWidth)
  } else if (columnCount <= 10) {
    columnWidth = 150
  } else {
    columnWidth = minWidth
  }

  return tableColumns.value.map(col => ({
    ...col,
    width: Math.min(columnWidth, maxWidth),
    ellipsis: {
      tooltip: true
    }
  }))
})
const containerWidth = ref(800)

// 计算横向滚动宽度
const scrollX = computed(() => {
  const totalWidth = processedColumns.value.reduce((sum, col) => sum + (col.width || 120), 0)
  // 只有当总宽度超过容器宽度时才启用横向滚动
  return totalWidth > containerWidth.value ? totalWidth : undefined
})

// 表格最大高度
const maxTableHeight = computed(() => {
  return topPanelHeight.value - 80 // 减去header和padding的高度
})
// 行属性
const rowProps = () => {
  return {
    style: 'cursor: pointer;'
  }
}

// 监听容器宽度变化
const updateContainerWidth = () => {
  if (tableWrapperRef.value) {
    containerWidth.value = tableWrapperRef.value.offsetWidth
  }
}
const tableWrapperRef = ref()
onMounted(() => {
  updateContainerWidth()
  window.addEventListener('resize', updateContainerWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateContainerWidth)
})

</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.header-actions .n-button {
  transition: all 0.2s;
}

.header-actions .n-button:hover {
  background: #F3F4F6;
  transform: translateY(-1px);
}
.table-wrapper {
  flex: 1;
  /* 关键：设置overflow为hidden，防止内容撑开容器 */
  overflow-x: auto; /* 修改此行 */
  overflow-y: hidden;
  width: 100%;
  min-width: 0; /* 允许flex子项收缩 */
  min-height: 0;
  position: relative;
}

/* 表格样式 */
.table-wrapper :deep(.n-data-table) {
  font-size: 12px;
  height: 100%;
  width: 100%;
}

/* 确保表格不会撑开容器 */
.table-wrapper :deep(.n-data-table-wrapper) {
  max-width: 100%;
}

.table-wrapper :deep(.n-data-table-base-table) {
  table-layout: fixed; /* 固定表格布局 */
}

/* 表头样式 */
.table-wrapper :deep(.n-data-table-th) {
  background: #F9FAFB;
  font-weight: 600;
  color: #374151;
  padding: 8px 12px;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 3;
}

/* 单元格样式 */
.table-wrapper :deep(.n-data-table-td) {
  color: #4B5563;
  padding: 8px 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Tooltip样式优化 */
.table-wrapper :deep(.n-ellipsis) {
  width: 100%;
}

/* 自定义滚动条 */
.table-wrapper :deep(.n-scrollbar) {
  --n-scrollbar-width: 8px;
  --n-scrollbar-height: 8px;
}

.table-wrapper :deep(.n-scrollbar-rail) {
  background: #F9FAFB;
  border-radius: 4px;
}

.table-wrapper :deep(.n-scrollbar-rail__scrollbar) {
  background: #D1D5DB;
  border-radius: 4px;
}

.table-wrapper :deep(.n-scrollbar-rail__scrollbar:hover) {
  background: #9CA3AF;
}

/* 横向滚动提示 */
.table-wrapper::before,
.table-wrapper::after {
  content: '';
  position: absolute;
  top: 40px; /* 避开表头 */
  bottom: 0;
  width: 20px;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.table-wrapper::before {
  left: 0;
  background: linear-gradient(to right, white, transparent);
}

.table-wrapper::after {
  right: 0;
  background: linear-gradient(to left, white, transparent);
}

/* 当有横向滚动时显示阴影 */
.table-wrapper:hover::before,
.table-wrapper:hover::after {
  opacity: 1;
}
/* NaiveUI组件样式覆盖 */
:deep(.n-button) {
  font-weight: 500;
  transition: all 0.2s;
}

:deep(.n-data-table) {
  --n-merged-th-color: #F9FAFB;
  --n-merged-td-color: white;
  --n-th-text-color: #374151;
  --n-td-text-color: #4B5563;
}

:deep(.n-tag) {
  border-radius: 6px;
  font-size: 11px;
}

/* 可选中的文本内容 */
.table-wrapper :deep(.n-data-table-td),
.table-wrapper :deep(.n-data-table-td *) {
  user-select: text !important;
}
</style>