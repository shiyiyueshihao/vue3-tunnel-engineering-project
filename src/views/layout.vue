<template>
    <!-- 
        渲染子页面 
            1. 复用公共组件，减少重复代码
            2. 保持路由层级与 URL 结构一致
            3. 统一控制布局内的逻辑
     -->
    <div class="layout-container">
        <SettingButton />
        <SidebarNav />
        <div class="layout-right-container" :style="{ marginLeft: ControlMenuStore.isShow ? '64px' : '210px' }">
            <TopNav />
            <div class="content">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import SidebarNav from '@/components/SidebarNav/SidebarNav.vue';
import TopNav from '@/components/TopNav/TopNav.vue';
import { useControlMenuStore } from '@/stores/ControlMenuStore';
import api from '../api/index.ts'
import { onMounted } from 'vue';
import { useLoginStore } from '@/stores/loginStore.ts';
import { useRouter } from 'vue-router';
import workManagementRoute from '@/router/dynamicRoute.ts'
import SettingButton from '@/components/SettingButton/SettingButton.vue';

const ControlMenuStore = useControlMenuStore()
const loginStore = useLoginStore()
const router = useRouter()

/**
 *  用户权限的数据获取
*/
onMounted(() => {
    api.getRouter({
        user: loginStore.permission
    }).then(res => {
        if (res.data.status === 200) {
            console.log(res.data);
            //  判断当前用户权限
            if (loginStore.permission === "admin") {
                router.addRoute('layout', workManagementRoute)
            }
            ControlMenuStore.menus = res.data.menuData.menus
        }
    })
})

</script>
<style lang="scss" scoped>
//  将 顶部导航 和 路由 放一起，控制 侧边栏缩起的时候进行填充
.layout-right-container {
    margin-left: 210px;
    transition: 300ms ease-in;

    .content {
        padding: 10px;
    }
}
</style>