import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import qs from "qs"; // 建议使用 qs 库
import { useLoginStore } from "@/stores/loginStore";
import { ElMessage } from "element-plus"; //  Element Plus 提示

/**
 * 定义换票期间的请求队列类型
 * 每一个回调函数都接收一个新的 token 并重新发起请求
 */
interface PendingRequest {
    (token: string): void;
}

// 标记位：是否正在执行刷新 Token 的请求
let isRefreshing = false;
// 请求队列：存放 AccessToken 过期期间产生的其他请求
let requestsQueue: PendingRequest[] = [];

/**
 * 创建 axios 实例
 */
const instance: AxiosInstance = axios.create({
    baseURL: "/api",
    timeout: 10000, // 增加到 10s 比较稳妥
    withCredentials: true, // 【关键】允许跨域携带 HttpOnly Cookie (存放 RefreshToken)
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
});

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const loginStore = useLoginStore();
        const token = loginStore.token;

        // 1. 自动携带 AccessToken
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 2. 处理数据格式化
        if (config.data instanceof FormData) {
            // 如果是文件上传，删除默认 Content-Type，让浏览器自动识别
            if (config.headers) delete config.headers['Content-Type'];
        } else if (config.method === "post" || config.method === "put") {
            // 普通对象进行序列化
            config.data = qs.stringify(config.data);
        }

        return config;
    },
    error => Promise.reject(error)
);

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        // 后端逻辑成功则直接返回
        return response;
    },
    async (error) => {
        const { config, response } = error;
        const loginStore = useLoginStore();

        // --- 【核心重构：双 Token 无感刷新逻辑】 ---

        // 1. 如果后端返回 401，代表 AccessToken 过期
        if (response && response.status === 401 && !config._retry) {

            // 如果已经在刷新中了，把当前的请求包装成 Promise 塞进队列挂起
            if (isRefreshing) {
                return new Promise((resolve) => {
                    requestsQueue.push((newToken: string) => {
                        config.headers.Authorization = `Bearer ${newToken}`;
                        resolve(instance(config)); // 换好票后重新执行
                    });
                });
            }

            // 如果没有在刷新，开启刷新流程
            isRefreshing = true;
            config._retry = true; // 标记该请求已重试，防止死循环

            try {
                // 调用刷新接口。注意：这里要用原始 axios 发送，避开实例拦截器
                // 后端会根据请求里的 HttpOnly Cookie (RefreshToken) 校验身份
                const refreshRes = await axios.post('/api/refresh', {}, { withCredentials: true });
                const newToken = refreshRes.data.accessToken;

                if (newToken) {
                    // 1. 更新 Pinia 和本地存储
                    loginStore.token = newToken;
                    localStorage.setItem('token', newToken);

                    // 2. 执行队列里正在排队的请求
                    requestsQueue.forEach((callback) => callback(newToken));
                    requestsQueue = [];

                    // 3. 重新发起当前触发 401 的这个请求
                    config.headers.Authorization = `Bearer ${newToken}`;
                    return instance(config);
                }
            } catch (refreshError) {
                // 如果换票也失败了（RefreshToken 也过期了），彻底清空并跳登录
                ElMessage.error("登录已过期，请重新登录");
                loginStore.token = '';
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // 2. 如果是 403，通常意味着 Token 彻底失效或重启导致密钥不匹配
        if (response && response.status === 403) {
            ElMessage.error("权限验证失败，请重新登录");
            loginStore.token = ''; // 清空 Pinia
            // 如果使用了 persist 插件，清空 store 就会自动同步到 localStorage
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // --- 其他错误处理 ---
        handleGeneralError(response?.status, response?.data?.msg);
        return Promise.reject(error);
    }
);

/**
 * 通用错误处理提示
 */
const handleGeneralError = (status: number | undefined, msg: string) => {
    switch (status) {
        case 403: ElMessage.error("拒绝访问"); break;
        case 404: ElMessage.error("请求地址不存在"); break;
        case 500: ElMessage.error("服务器发生意外"); break;
        default: ElMessage.error(msg || "未知错误");
    }
};

export default instance;