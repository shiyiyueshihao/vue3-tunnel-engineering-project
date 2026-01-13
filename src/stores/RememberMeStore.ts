import { defineStore } from 'pinia'

/**
 *  创建一个 记住我仓库 用来存储状态 
 *      1.  记住我 输入框 状态打勾
 *      3.  用户
*/



interface RememberMeStoreParams {
    username: string | number
    rememberMe: boolean,
    password:string
}

export const useRememberMeStore = defineStore("RememberMe", {
    state: (): RememberMeStoreParams => {
        return {
            username: "",
            rememberMe: false,
            password:""
        }
    },
    persist: {
        storage: localStorage,
        key: 'rememberMe'
    }
})