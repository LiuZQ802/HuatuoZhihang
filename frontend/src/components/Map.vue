<template>
  <div id="map" style=" height: 100%; width: 100%;" ></div>
</template>
<script setup lang="ts">
import {useStore} from "vuex";
import {getCurrentLocation} from "@/utils/getCurrentLocation.ts";

/** 属性*/
const store=useStore()


/** 方法*/
onMounted(async ()=> {
  await store.dispatch('MapConfigStore/initializeMap')
  const position = await getCurrentLocation();
  store.commit('ChatConfigStore/setLatitude',position.lat)
  store.commit('ChatConfigStore/setLongitude',position.lng)
  window.handleRoute = function (mode, lat, lng) {
    const payload = {
      startLat: position.lng,
      startLon: position.lat,
      endLat: lat,
      endLon: lng,
      mode
    };
    store.dispatch('MapConfigStore/pathPlan', payload);
  };
})
watch(
  () => store.state.MapQAStore.mapData,
  (rawData) => {
    const map = store.state.MapConfigStore.Map
    if (!map || !rawData) return

    store.dispatch('MapConfigStore/addData',rawData)
  },
  { immediate: true, deep: true }
)

</script>

<style scoped>
</style>