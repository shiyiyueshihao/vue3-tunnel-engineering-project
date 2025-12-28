<template>
  <RouterView />

</template>


<script setup lang="ts">
import { RouterView } from 'vue-router'

//  默认初始化 中文 
localStorage.setItem("lang", "zh")

</script>


<style>
/* 公共样式 -- 不加 scoped */
html,
body,
#app {
  height: 100%;
  width: 100%;
  font-family: "幼圆";
  background-color: #f1f1f1;
}

/* 去掉 element-plus 内 menu菜单的 右侧边框 */
.el-menu {
  border-right: 0 !important;
}

/*  去掉 el-form-item 的底部margin */
.el-form-item {
  margin-bottom: 0 !important;
}
</style>
