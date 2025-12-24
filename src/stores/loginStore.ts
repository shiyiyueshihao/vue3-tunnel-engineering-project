import { defineStore } from 'pinia'


//  给 useLoginStore 的 state 定义一个 接口 类型规范
interface LoginStoreState {
    token: string,
    permission: string,
    username: string
}

export const useLoginStore = defineStore("login", {
    //  组合式API
    state: (): LoginStoreState => {
        //  网络请求拿到的数据 做状态管理 --  后续存储做准备
        return {
            token: "",
            permission: "",
            username: ""
        }
    },
    //  本地仓库持久化存储方式  --  persistedstate  --  在 全局引入和使用
    persist: {
        storage: localStorage,
        key: 'login'
    }
})



/*
pinia-plugin-persistedstate
✅基础功能（两者一致）：都能把 Pinia 的 state 持久化到 localStorage/sessionStorage，满足简单场景（比如存 token、用户名）：
    // pinia-plugin-persist 写法
        export const useLoginStore = defineStore('login', {
            state: () => ({ token: '', username: '' }),
            persist: {
                enabled: true,
                strategies: [{ storage: localStorage, key: 'login' }]
            }
        })

    // pinia-plugin-persistedstate 基础写法（兼容上述逻辑）
            export const useLoginStore = defineStore('login', {
            state: () => ({ token: '', username: '' }),
            persist: {
                storage: localStorage,
                key: 'login'
            }
        })

❌ 进阶功能（仅 persistedstate 支持）：比如只想持久化 token，不持久化 username，persist 做不到，但 persistedstate 可以通过 paths 实现：
   // 仅持久化 token 字段（persistedstate 专属）
    export const useLoginStore = defineStore('login', {
        state: () => ({ token: '', username: '', age: 0 }),
        persist: {
            storage: localStorage,
            paths: ['token'] // 只存 token，其他字段不持久化
        }
    })

    再比如自定义存储引擎（比如存到 cookie 而非 localStorage）：

    // persistedstate 支持自定义存储
    import Cookies from 'js-cookie'
    export const useLoginStore = defineStore('login', {
        state: () => ({ token: '' }),
        persist: {
            storage: {
                getItem: (key) => Cookies.get(key),
                setItem: (key, value) => Cookies.set(key, value),
                removeItem: (key) => Cookies.remove(key)
            }
        }
    }


配置语法：persistedstate 更灵活
    // persistedstate 简洁写法（推荐）
    persist: { storage: sessionStorage }

    // 也支持 strategies 数组（兼容 persist 的写法）
    persist: {
        strategies: [{ storage: sessionStorage, key: 'login' }]
    }

*/