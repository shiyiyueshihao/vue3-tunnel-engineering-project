<template>
    <div class="topNav">
        <!-- 控制左侧侧边栏显示与隐藏 -->
        <div class="toggle-menu">
            <div class="toggle">
                <el-icon v-if="ControlMenuStore.isShow" class="toggle-icon" @click="openMenu">
                    <Expand />
                </el-icon>
                <el-icon v-else class="toggle-icon" @click="closeMenu">
                    <Fold />
                </el-icon>
            </div>
        </div>
        <div class="topNav-breadcrumb">
            <el-breadcrumb separator="/">
                <!-- <el-breadcrumb-item :to="{ path: '/' }">返回首页</el-breadcrumb-item> -->
                <el-breadcrumb-item>当前</el-breadcrumb-item>
                <!-- 直接拿仓库的  地址  防止刷新回到初始状态 -->
                <el-breadcrumb-item>{{ ControlMenuStore.breadcrumb }}</el-breadcrumb-item>
                <!-- <el-breadcrumb-item>{{ breadcrumb }}</el-breadcrumb-item> -->
            </el-breadcrumb>
        </div>
        <div class="topNav-user">
            <el-dropdown>
                <span class="el-dropdown-link">
                    {{ loginStore.username }}
                    <el-icon class="el-icon--right">
                        <ArrowDown />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <!-- 路由跳转 到个人中心 即可 -->
                            <router-link to="personalcenter">个人中心</router-link>
                        </el-dropdown-item>
                        <el-dropdown-item @click="logoutHandler">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script lang="ts" setup>

import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { useControlMenuStore } from '@/stores/ControlMenuStore';


const router = useRouter()
const ControlMenuStore = useControlMenuStore()

/**
 *  退出登录
 *      1.  清空 store 所有内容 --  pinia 商店
 *      2.  回到登录页面  --  路由跳转
 */

import { useLoginStore } from '@/stores/loginStore';
// import { ref } from 'vue';
const loginStore = useLoginStore()

//  退出登录
function logoutHandler() {
    loginStore.username = ""
    loginStore.token = ""
    loginStore.permission = ""

    //  别忘了回到登录页面 
    // router.push("/login")
    router.replace({ name: 'login' })   // 防止用户点击浏览器回退按钮，又回到已退出的首页

}

/**
 *  关闭菜单栏
*/


function closeMenu() {
    ControlMenuStore.isShow = true;
}

/**
 *  显示菜单栏
*/
function openMenu() {
    ControlMenuStore.isShow = false;
}

//  会失去响应式  --  所以直接调用商店的面包屑更直接
//  toRefs 只能接收整个 reactive 对象（比如 ControlMenuStore）
// const breadcrumb = ref<string>("首页")
// if(ControlMenuStore.breadcrumb){
//     breadcrumb.value = ControlMenuStore.breadcrumb
// }

</script>

<style lang="scss" scoped>

.topNav {
    //  侧边栏收起的时候需要让他填充剩余空间
    //  这里已经满了 所以我们可以向上找父容器  --  layout-right-container
    width: 100%;
    height: 60px;
    background-color: #fff;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 12%), 0 0 3px 0 rgb(0 0 0 /4%);

    .toggle-menu {
        padding-top: 17.5px;
        padding-left: 10px;

        .toggle {

            float: left;

            .toggle-icon {
                cursor: pointer;
                font-size: 25px;
            }
        }

    }

    .topNav-breadcrumb {
        float: left;
        line-height: 60px;
        margin-top: 6px;
        margin-left: 20px;
    }

    .topNav-user {
        cursor: pointer;
        font-size: 15px;
        position: absolute;
        right: 20px;
        top: 20px;
        
        .el-dropdown-link{
            font-size: 18px;
        }
    }
}
</style>