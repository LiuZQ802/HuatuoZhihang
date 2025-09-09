<template>
 <huatuoselect @selectedItem="selectedItem"/>
</template>

<script setup lang="ts">

import  huatuoselect from "huatuozn"


const selectedItem = ref<string | null>(null)
</script>

<style scoped>
</style>
