import { defineStore } from 'pinia'

/**
 *  创建一个 控制菜单栏的状态仓库 用来存储状态 
 *      1.  控制菜单栏的显示与隐藏
 *      2.  控制顶部启动按钮的切换
 *      3.  存储路由路径
 *      4.  存储请求数据 渲染侧边栏
*/

interface MenusItem {
    path: string;
    name: string;
    icon: string;
    children?: any[]
}

interface useControlMenuStoreParams {
    isShow: boolean,
    breadcrumb: string,
    routerPath: string,
    menus: MenusItem[]
}

export const useControlMenuStore = defineStore("ControlMenu", {
    state: (): useControlMenuStoreParams => {
        return {
            isShow: false,
            breadcrumb: "首页",
            routerPath: "/",
            menus: []
        }
    },
    //  本地仓库持久化存储方式  --  persistedstate  --  在 全局引入和使用
    persist: {
        storage: localStorage,
        key: 'menus'
    }
})