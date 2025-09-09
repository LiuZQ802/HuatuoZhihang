<template>
  <n-space justify="center" class="py-4 border-t w-full">
    <n-text depth="3" style="font-size: 14px;">
     Copyright © {{ year  }} LIESMARS, Wuhan University. All rights reserved.
    </n-text>
  </n-space>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

</script>

<style lang="less" scoped>
</style>/