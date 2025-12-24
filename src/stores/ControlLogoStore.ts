import { defineStore } from 'pinia'
interface showOrHide {
    isShowLogo: boolean
}

export const useControlLogoStore = defineStore("ControlLogoStore", {
    state: (): showOrHide => {
        return {
            isShowLogo: true
        }
    },
    //  本地仓库持久化存储方式  --  persistedstate  --  在 全局引入和使用
    persist: {
        storage: localStorage,
        key: 'Logo'
    }
})