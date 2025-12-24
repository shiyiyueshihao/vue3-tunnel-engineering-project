import './assets/init.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import piniaPersistedState from 'pinia-plugin-persistedstate'//  引入 pinia 仓库持久化插件

import App from './App.vue'
import router from './router/index.ts'

import echarts from './plugins/echarts.ts'  //  引入 自己定义(封装)的 echarts 插件

const app = createApp(App)

const pinia = createPinia()   //  创建 pinia 
pinia.use(piniaPersistedState)  //  使用插件
app.use(echarts)    //  使用 自己定义(封装)的 echarts 插件

app.use(pinia)

app.use(router)

app.mount('#app')
