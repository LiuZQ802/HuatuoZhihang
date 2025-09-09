<template>
    <huatuoLeft @sickInfo="sickInfo" @isReady="isReady" />
</template>

<script setup lang="ts">
import huatuoLeft from "huatuozn"

import {useStore} from "vuex";
import {computed} from "vue";
/** 属性*/
const store=useStore()

const sickInfo=computed(()=>store.state.UserProfileStore.info)
const isReady=computed(()=>store.state.RobotStore.isReady)


</script>

<style scoped>


</style>