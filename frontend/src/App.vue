<template>
  <n-config-provider>
    <n-message-provider>
      <n-layout class="layout">
        <Main/>
        <Footer/>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import Main from '@/pages/Main.vue';
import Footer from '@/components/Footer.vue';
import { useStore } from "vuex";
import {getCurrentModel,getAllModels} from "@/api";


/**   属性 */
const store = useStore()

/**   方法 */
onMounted(async () => {
    try {
        const [res1, res2,res3,res4] = await Promise.all([
          getAllModels({}),
          getCurrentModel({}),
        ]);

        store.commit("ChatConfigStore/setModelList", res1.data.modelList);
        store.commit("ChatConfigStore/setCurrentModel", res2.data.modelName);

    }catch (err) {
      console.error("获取模型失败:", err);
   }
})
</script>
<style scoped>
@import './style/common.less';
.layout{
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>