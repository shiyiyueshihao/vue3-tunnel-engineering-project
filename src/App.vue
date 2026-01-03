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


/* 1. 针对所有 el-dropdown 的触发元素 */
.el-dropdown-link:focus,
.el-dropdown-link:focus-visible,
.el-dropdown-selfdefine:focus,
.el-dropdown-selfdefine:focus-visible {
  outline: none !important;
}

/* 2. 针对可能出现的其它可聚焦组件 (如按钮、输入框等) */
/* :focus-visible 是现代浏览器更推荐的属性，它只在键盘导航时显示轮廓，鼠标点击时不显示 */
:focus {
  outline: none;
}

/* 3. 专门针对 Element Plus 下拉菜单的包裹层 */
.el-dropdown:focus,
.el-dropdown-menu:focus {
  outline: none !important;
}

/*  针对Tree 树形控件 做 字体大小调整 */
.is-truncated {
  font-size: 16px !important;

}

/*  针对Tree 树形控件 做 选中样式修改  --  选中框背景颜色 */
.is-current .el-tree-node__content{
  background-color: antiquewhite !important;
}
/*  针对Tree 树形控件 做 选中样式修改  --  字体颜色 */
.is-current .el-tree-node__content .el-tree-node__label{
  color: blue;
}

/* el-card 卡片 的边框 */
.el-card{
  border-radius: 10px !important;
}
/* 内部实现 flex 布局 垂直居中 */
.el-card .el-card__body{
  display: flex;
  align-items: center;
}
</style>
