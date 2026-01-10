<template>
    <div class="login-container">

        <!-- 功能区 -->
        <div class="blurred-container">
            <div class="title-container" style="margin:40px 0;">
                <h3 class="title">隧道后台管理系统</h3>
            </div>
            <div style="margin-bottom: 50px;">
                <h3 style="font-size: 20px;">Vue3项目系统</h3>
            </div>
            <!-- 这里的model 统一收集当前表单内所有表单项 方便后续统一管理 / 提交表单数据 -->
            <el-form class="form" :model="user">
                <el-form-item>
                    <!-- prefix-icon  加前缀 suffix 加后缀 -->
                    <el-input :prefix-icon="User" v-model="user.username" type="text" placeholder="请输入账号"
                        @keyup.enter="loginHandler" style="margin-bottom: 15px;height: 50px;" />
                </el-form-item>
                <el-form-item>
                    <el-input :prefix-icon="Lock" v-model="user.password" :type="showPassword ? 'text' : 'password'"
                        placeholder="请输入密码(最小长度为6最大长度为16)" maxlength="16" minlength="6" @keyup.enter="loginHandler"
                        style="margin-bottom: 15px;height: 50px;">
                        <!-- @keyup.enter="loginHandler" 监听回车进行登录 -->
                        <!-- 通过 #suffix 在 el-input 内部加后缀 自己写js逻辑-->
                        <template #suffix>
                            <el-icon class="icon-password" v-if="user.password" @click="showPassword = !showPassword">
                                <View v-if="showPassword" />
                                <Hide v-else />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <!-- 记住我 -->
                <div class="rememberMe-container"
                    style="display: flex;justify-content: space-between;margin-bottom: 15px;">
                    <el-checkbox v-model="rememberMe" label="记住我" size="large" style="height: auto;" />
                    <router-link to="#" style="font-size: 14px;">忘记密码？</router-link>
                </div>
                <!-- 协议 -->
                <div></div>
            </el-form>

            <el-button class="login" type="primary" @click.prevent="loginHandler"
                style="margin-bottom: 15px;height: 40px;">登录</el-button>
            <div class="register">
                <span style="font-size: 16px;">还没有账号？</span>
                <router-link to="/register" style="font-size: 16px;color: blue;">立即注册</router-link>
            </div>
        </div>


    </div>
</template>

<script setup lang="ts">
//  element-plus 自带的 眼睛 
import { View, Hide, User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue';
//  引入 封装好的 api --  登录调用
import api from '../../api/index.ts'
//  引入路由  --  useRouter
import { useRouter } from 'vue-router';
const router = useRouter()

//  加入 登录 仓库
import { useLoginStore } from '@/stores/loginStore.ts';
//  创建登录仓库对象
const loginStore = useLoginStore()
//  限制账号密码的接口
interface userType {
    username: string | number,
    password: string | number
}

//  声明用户信息
const user = reactive<userType>({
    username: "",
    password: ""
})

//  写个状态
const showPassword = ref<boolean>(false)
//  监听 password 做 空/输入改变(也就是新旧值不相同的时候) 该 input type 为 password 从而达到 看不到 密码的效果
watch(
    () => user.password,
    (newValue: string | number, oldValue: string | number) => {
        if (newValue == "" || newValue != oldValue) {
            showPassword.value = false
        }
    }
)

/**
 *      注册 按钮
 */

function registerHandler() {

}


/**
 *      记住我
 */
const rememberMe = ref<boolean>(false)

// 用 pinia 记录 remember_token 
import { useRememberMeStore } from '@/stores/RememberMeStore.ts';
const RememberMeStore = useRememberMeStore()

//  做一次  掉取 看上次是否记住账号密码
rememberMe.value = RememberMeStore.rememberMe
/**
 *          页面初始 因为有记住状态 所以就赋值账号密码和保存这个✓还有re-token
 */
onMounted(() => {
    //  将 账号密码赋值
    const isActive = !!rememberMe.value;
    if (isActive) {
        user.username = RememberMeStore.username;
        user.password = "******_saved"
    }
})

/**
 *          封装 登录  功能
 */

function login() {
    api.getLogin({
        username: user.username,
        password: user.password
    }).then(res => {
        // console.log(res.data)
        //  登录成功之后才能给赋值 ！！
        if (res.data.status == 200) {
            loginStore.token = res.data.token
            loginStore.username = res.data.username
            loginStore.permission = res.data.permission
            RememberMeStore.password = "******_saved"
            RememberMeStore.remember_token = res.data.remember_token
            router.push('/')
            ElMessage.success("登录成功！")
        } else {
            //  错误提示 -- 给用户  --  element-plus 自带的错误提示框 Message
            ElMessage.error(res.data.msg)
        }
    }).catch(err => {
        console.log(err);

    }).finally(() => {
    })


}

/**
 *          登录按钮 
 *              有 记住我 逻辑
 */

function loginHandler() {

    const isActive = !!rememberMe.value;
    //  记住我 处于激活状态
    if (isActive) {

        const rememberToken = RememberMeStore.remember_token
        //  记住我  就将 后续的记住保存在存储中
        RememberMeStore.rememberMe = true
        //  有 rem-token  --  说明已经登陆过一次了
        if (rememberToken) {

            //  调用 api  进行 rem-token 登录
            api.loginByToken({
                username: user.username,
                remember_token: rememberToken
            }).then(res => {
                if (res.data.status === 200) {

                    //  做 第二次 打开页面 保存记住我 和 保存账号密码操作

                    loginStore.username = res.data.username
                    loginStore.permission = res.data.permission
                    RememberMeStore.remember_token = res.data.remember_token
                    RememberMeStore.password = "******_saved"
                    loginStore.token = res.data.token;
                    router.push('/')
                    ElMessage.success("登录成功！")
                }
            }).catch(err => {
                console.log(err);
                ElMessage.error(err)

            }).finally(() => {
            })

        } else {
            //  没有 rem-token  说明第一次登录  
            login()
        }

    } else {
        //  记住我 没打勾
        login()
        //  没记住 需要将 状态 清掉
        RememberMeStore.username = "";
        RememberMeStore.rememberMe = false;
        RememberMeStore.password = ""
        RememberMeStore.remember_token = ""
    }

}


</script>

<style scoped lang="scss">
//  引入 scss 文件  --  自定义的 媒体查询  --  用 @use 和 as 来导入
@use '../../assets/scss/customMedia.scss' as customMedia;


.icon-password {
    //  让 他变成可点击状态  就是小手
    cursor: pointer;
}

.login-container {
    width: 100%;
    height: 100%;
    // background-color: #EAEEF5;
    background-image: url(../../assets/images/loginBackground.png);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
    position: relative;
    text-align: center;

    .blurred-container {

        position: absolute;
        top: 15%;
        right: 5%;
        box-shadow: 0 0 50px gray;
        background-color: rgba($color: #fff, $alpha: 0.7);
        border-radius: 10px;

        @include customMedia.custom-media(0, 786) {
            width: 300px;
            height: 540px;
        }

        @include customMedia.custom-media(786, 1200) {
            width: 350px;
            height: 540px;
        }

        @include customMedia.custom-media(1200, 2560) {
            width: 400px;
            height: 540px;
        }

        //  添加动画  过渡平滑
        transition: all 500ms ease;

        .title {
            @include customMedia.custom-media(0, 786) {
                font-size: 27px;
            }

            @include customMedia.custom-media(786, 1200) {
                font-size: 30px;
            }

            @include customMedia.custom-media(1200, 2560) {
                font-size: 37px;
            }

            transition: font-size 500ms ease;

            color: black;
            font-family: "幼圆";
            text-align: center;
            padding-top: 25px;

        }

        .form {

            //  继承自定义媒体查询
            @include customMedia.custom-media(0, 786) {
                width: 270px;
            }

            @include customMedia.custom-media(786, 1200) {
                width: 300px;
            }

            @include customMedia.custom-media(1200, 2560) {
                width: 370px;
            }

            transition: width 500ms ease;

            margin: 0 auto;

        }

        .button {
            @extend .form
        }
    }

}

.login {
    @media screen and (max-width:786px) {
        width: 270px;
    }

    @media screen and (min-width:786px) and (max-width:1200px) {
        width: 300px;
    }

    @media screen and (min-width:1200px) and (max-width:2560px) {
        width: 370px;
    }

    border-radius: 50px;
    transition: width 500ms ease;
}
</style>