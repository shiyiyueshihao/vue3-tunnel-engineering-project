import { defineStore } from 'pinia'

/**
 *  创建一个 记住我仓库 用来存储状态 
 *      1.  记住我 输入框 状态打勾
 *      2.  remember_token
 *      3.  用户
 *      4.  假密码
*/



interface RememberMeStoreParams {
    username: string | number
    rememberMe: boolean,
    remember_token: string,
    password:string
}

export const useRememberMeStore = defineStore("RememberMe", {
    state: (): RememberMeStoreParams => {
        return {
            username: "",
            rememberMe: false,
            remember_token: "",
            password:""
        }
    },
    persist: {
        storage: localStorage,
        key: 'rememberMe'
    }
})