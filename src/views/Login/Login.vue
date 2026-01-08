<template>
    <div class="login-container">
        <div class="blurred-container">
            <div class="title-container">
                <h3 class="title">隧道后台管理系统登录</h3>
            </div>
            <!-- 这里的model 统一收集当前表单内所有表单项 方便后续统一管理 / 提交表单数据 -->
            <el-form class="form" :model="user">
                <el-form-item>
                    <!-- prefix-icon  加前缀 suffix 加后缀 -->
                    <el-input :prefix-icon="User" v-model="user.username" type="text" placeholder="请输入账号"
                        @keyup.enter="loginHandler" style="margin-bottom: 15px;" />
                </el-form-item>
                <el-form-item>
                    <el-input :prefix-icon="Lock" v-model="user.password" :type="showPassword ? 'text' : 'password'"
                        placeholder="请输入密码(最小长度为6最大长度为16)" maxlength="16" minlength="6" @keyup.enter="loginHandler" style="margin-bottom: 15px;">
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
            </el-form>
            <el-button class="button" type="primary" @click.prevent="loginHandler">登录</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
//  element-plus 自带的 眼睛 
import { View, Hide, User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue';
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

//  登录按钮
function loginHandler() {
    // console.log(user);
    //  调用 api 实现post 接口登录
    api.getLogin({
        username: user.username,
        password: user.password
    }).then(res => {
        // console.log(res.data)
        //  登录成功之后才能给赋值 ！！
        if (res.data.status == 200) {
            //  赋值完 可以用 vue 测试工具里面的小菠萝 来 查看数据 
            loginStore.token = res.data.token
            loginStore.username = res.data.username
            loginStore.permission = res.data.permission
            router.push('/')
            ElMessage.success("登录成功！")
        } else {
            //  错误提示 -- 给用户  --  element-plus 自带的错误提示框 Message
            ElMessage.error(res.data.msg)
        }
    })
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
    background-image: url('../../assets/images/LoginBackgroundImage.png');
    background-position: center; //核心：让背景图水平、垂直都居中
    background-repeat: no-repeat; //避免图片重复平铺
    background-size: cover; //让图片覆盖容器（保持比例，裁剪超出部分），也可以用 contain（完整显示图片）
    box-sizing: border-box;
    text-align: center;
    padding-top: 28vh;

    //  模糊窗口
    .blurred-container {

        @include customMedia.custom-media(0, 786) {
            width: 300px;
            height: 240px;
        }

        @include customMedia.custom-media(786, 1200) {
            width: 350px;
            height: 240px;
        }

        @include customMedia.custom-media(1200, 2560) {
            width: 400px;
            height: 240px;
        }

        //  添加动画  过渡平滑
        transition: all 500ms ease;
        margin: 0 auto;
        background-color: rgba($color: #fff, $alpha: 0.5);
        border-radius: 10px;

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

            // @include custom-media(1920, 2560) {
            //     font-size: ;
            // }
            // @include custom-media(2560) {
            //     font-size: ;
            // }

            transition: font-size 500ms ease;

            color: black;
            font-family: "幼圆";
            text-align: center;
            padding-top: 25px;
            padding-bottom: 40px;
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

            // @include custom-media(1920, 2560) {
            //     width: $fontSize * 2;
            // }
            // @include custom-media(2560) {
            //     width: $fontSize * 1;
            // }
            transition: width 500ms ease;

            margin: 0 auto;

        }

        .button {
            @extend .form
        }
    }

}
</style>