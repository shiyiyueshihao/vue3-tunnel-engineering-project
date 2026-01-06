<template>
    <!-- <div class="SidebarNav" > -->
    <div class="SidebarNav" :style="{ width: ControlMenuStore.isShow ? '64px' : '210px' }">
        <!-- 通过 动态的 style  来控制 缩进  别忘了修改动画  --  el统一 ease-in -->
        <div class="logo" v-if="ControlLogoStore.isShowLogo">
            {{ ControlMenuStore.isShow ? '隧道' : '隧道工程项目' }}
        </div>
        <el-menu class="el-menu-vertical-demo" text-color="#fff" active-text-color="#fffd0b" background-color="#304156"
            :default-active="routerPath" router :collapse="ControlMenuStore.isShow">
            <!-- 
            active-text-color  点击后的颜色
            router   路由位置参数(index 匹配路由path)
            default-active  匹配 index的值  绑定为路由的路径 这样跳转也会自动跟踪
            collapse - 控制侧边栏显示与隐藏  通过仓库统一管理状态
            <el-sub-menu > 渲染 子页面  但是他又跟el-menu-item同级，所以这里引入 template 来遍历所有数据
          -->
            <!-- 动态渲染 -->

            <template v-for="(item, index) in ControlMenuStore.menus" :key="index">

                <el-sub-menu v-if="item.children" :index="item.path">
                    <template #title>
                        <component :is="iconMap[item.icon]" class="icon"></component>
                        <span>{{ item.name }}</span>
                    </template>
                    <el-menu-item :index="item.path + childrenItem.path"
                        v-for="(childrenItem, childrenIndex) in item.children" :key="childrenIndex">
                        <span>{{ childrenItem.name }}</span>
                    </el-menu-item>
                </el-sub-menu>

                <el-menu-item v-else :index="item.path">
                    <!-- <el-icon> <Flod /> </el-icon> -->
                    <!-- 用 iconMap 和 解构 完成 组件渲染 -->
                    <component :is="iconMap[item.icon]" class="icon"></component>
                    <span> {{ item.name }}</span>
                </el-menu-item>

            </template>

        </el-menu>



    </div>
</template>

<script lang="ts" setup>
import { House, Connection, MessageBox, ChatSquare, Discount, Pointer, Setting } from '@element-plus/icons-vue';
const iconMap: Record<string, Component> = { House, Connection, MessageBox, ChatSquare, Discount, Pointer, Setting }
import { useControlMenuStore } from '@/stores/ControlMenuStore';
import { ref, type Component } from 'vue';
const ControlMenuStore = useControlMenuStore()
import { useControlLogoStore } from '@/stores/ControlLogoStore';
const ControlLogoStore = useControlLogoStore()

// import { useRoute } from 'vue-router'
//  侧边栏 动态展示 右侧 主要内容
// const route = useRoute()
//  侧边栏 动态展示 右侧 主要内容  --  更新  --  刷新页面也会匹配侧边栏(Pinia保存路由路径)
const routerPath = ref<string>("/")
/**
 *  修复页面的刷新高亮还原问题设置
*/
if (ControlMenuStore.routerPath) {
    routerPath.value = ControlMenuStore.routerPath
}

// console.log(route);

</script>

<style lang="scss" scoped>
//  左侧侧边栏底布
.SidebarNav {
    width: 210px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    // bottom: 0;
    background-color: #304156; //  背景颜色跟 侧边栏一致
    transition: 300ms ease-in;

    .logo {
        width: 100%;
        height: 60px;
        line-height: 60px;
        background-color: #364e6d;
        text-align: center;
        font-size: 25px;
        color: white;
        overflow: hidden;
        // transition: 300ms ease-in;
    }

    .el-menu-vertical-demo {

        .icon {
            width: 16px;
            height: 16px;
            margin-right: 5px;
        }
    }
}
</style>