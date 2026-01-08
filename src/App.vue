<template>
  <RouterView />

</template>


<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElMessageBox } from 'element-plus'
//  默认初始化 中文 
localStorage.setItem("lang", "zh")


// 在 App.vue 中修改监听逻辑
window.addEventListener('storage', (e) => {
  if (e.key === 'login' && e.newValue !== e.oldValue) {
    const currentPath = window.location.pathname;

    // 逻辑 A：如果正在登录页，发现别的标签页登录成功了，直接带我飞（进首页）
    if (currentPath === '/login') {
      const newData = JSON.parse(e.newValue || '{}');
      if (newData.token) {
        window.location.href = '/'; // 发现新票，自动登录
      }
      return;
    }

    // 逻辑 B：如果在业务页，弹出正式提醒
    ElMessageBox.alert('检测到账号已在其他页面登录，请刷新同步状态', '安全提醒', {
      confirmButtonText: '确定',
      type: 'warning',
      callback: () => {
        // 关键：这里刷新后，由 router.beforeEach 和 axios 拦截器进行后端 Token 校验
        window.location.reload(); 
      }
    });
  }
});


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
.is-current .el-tree-node__content {
  background-color: antiquewhite !important;
}

/*  针对Tree 树形控件 做 选中样式修改  --  字体颜色 */
.is-current .el-tree-node__content .el-tree-node__label {
  color: blue;
}

/* el-card 卡片 的边框 */
.el-card {
  border-radius: 0.5vw !important;
}

/* 内部实现 flex 布局 垂直居中 */
.el-card .el-card__body {
  display: flex;
  align-items: center;
}

/* 全局 配置 nprogress 路由跳转进度条样式设置 */
/* 修改进度条颜色 */
#nprogress .bar {
  background: #409EFF !important;
  /* 这里换成你选中的那个蓝色 */
  height: 3px !important;
  /* 进度条高度 */
}

/* 修改进度条末端光晕颜色 */
#nprogress .peg {
  box-shadow: 0 0 10px #409EFF, 0 0 5px #409EFF !important;
}

/* 修改 Loading 文字颜色 */
.el-loading-parent--relative .el-loading-text {
  color: #000 !important;
}

/* 如果你想顺便把那个转圈圈的颜色也改了 */
/* .el-loading-parent--relative .path {
  stroke: #ff9900 !important;
} */
</style>
