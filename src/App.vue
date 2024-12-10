<template>
  <div id="app">
    <router-view /> <!-- 必须包含 router-view，才能正确渲染路由组件 -->
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* 可选样式 */
</style>
