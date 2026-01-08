import { defineStore } from 'pinia'

interface LoginStoreState {
    token: string, // 这里存的是短票 AccessToken
    permission: string,
    username: string
}

export const useLoginStore = defineStore("login", {
    state: (): LoginStoreState => {
        return {
            token: "",
            permission: "",
            username: ""
        }
    },
    // 增加 actions 来管理数据变化
    actions: {
        // 登录或刷新成功后，调用这个方法更新短票
        setToken(newToken: string) {
            this.token = newToken;
        },
        // 退出登录或彻底过期时，调用这个方法清空
        clearLoginInfo() {
            this.token = "";
            this.permission = "";
            this.username = "";
            // 插件会自动清空 localStorage 里的 'login'
        }
    },
    persist: {
        storage: localStorage,
        key: 'login' // 存储在本地的键名
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