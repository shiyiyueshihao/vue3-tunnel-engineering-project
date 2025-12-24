<template>
  <RouterView />

</template>


<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>


<style>
/* 公共样式 -- 不加 scoped */
html,body,#app{
  height: 100%;
  width: 100%;
  font-family: "幼圆";
  background-color: #f1f1f1;
}

/* 去掉 element-plus 内 menu菜单的 右侧边框 */
.el-menu{
  border-right: 0 !important;
}
</style>
