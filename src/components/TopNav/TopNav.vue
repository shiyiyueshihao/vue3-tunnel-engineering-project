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
        <!-- 面包屑 -->
        <div class="topNav-breadcrumb">
            <el-breadcrumb separator="/">
                <!-- <el-breadcrumb-item :to="{ path: '/' }">返回首页</el-breadcrumb-item> -->
                <!-- 用  i18n 加载 文本  实现 中英文切换 -->
                <el-breadcrumb-item>{{ $t('message.navs') }}</el-breadcrumb-item>
                <!-- 直接拿仓库的  地址  防止刷新回到初始状态 -->
                <el-breadcrumb-item>{{ ControlMenuStore.breadcrumb }}</el-breadcrumb-item>
                <!-- <el-breadcrumb-item>{{ breadcrumb }}</el-breadcrumb-item> -->
            </el-breadcrumb>
        </div>

        <!-- 中英文切换 -->
        <div class="topNav-lang">
            <el-dropdown class="example-showcase">
                <span class="el-dropdown-link">
                    语言切换
                    <el-icon class="el-icon--right">
                        <ArrowDown />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="changeLang('zh')">中文</el-dropdown-item>
                        <el-dropdown-item @click="changeLang('en')">英文</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <!-- 个人中心 / 退出登录 -->
        <div class="topNav-user">
            <el-dropdown class="example-showcase">
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
import api from '@/api';
import { ElMessage } from 'element-plus';
// import { ref } from 'vue';
const loginStore = useLoginStore()

//  退出登录
async function logoutHandler() {
    try {
        // 1. 调用后端接口，抹掉 HttpOnly Cookie
        // 注意：即使后端接口报错，前端也应该继续执行清理逻辑
        await api.logout();
    } catch (error) {
        console.error("后端退出接口调用失败", error);
    } finally {
        // 2. 清空 Pinia 商店所有内容（内存中的短 Token）
        loginStore.username = "";
        loginStore.token = "";
        loginStore.permission = "";

        // 3. (可选) 清理所有的持久化数据，防止残留
        localStorage.removeItem('user-storage'); // 如果你用了持久化插件

        // 4. 回到登录页面并替换历史记录
        // replace 防止用户通过浏览器“后退”按钮回到已退出的系统页面
        router.replace({ name: 'login' });

        // 5. 提示用户
        ElMessage.success("您已安全退出");
    }
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

/**
 *      语言切换 
*/
//  中英文切换
function changeLang(lang: string) {
    console.log(lang);
    localStorage.setItem("lang", lang)
    //  语言切换 刷新UI
    location.reload()
}




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

        //  前面写这个 忘记调试了 优化了 admin旁边的箭头位置
        .example-showcase {

            .el-dropdown-link {
                cursor: pointer;
                display: flex;
                align-items: center;
                font-size: 18px;
            }

            position: absolute;
            right: 20px;
            top: 20px;
        }
    }

    .topNav-lang {
        @extend .topNav-user;

        .example-showcase {
            position: absolute;
            right: 120px;
            top: 20px;

            .el-dropdown-link {
                font-size: 15px;
            }

        }
    }
}
</style>