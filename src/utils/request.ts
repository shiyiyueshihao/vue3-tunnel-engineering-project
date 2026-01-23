import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, Canceler } from "axios";
import qs from "qs";
import { useLoginStore } from "@/stores/loginStore";
import { ElMessage } from "element-plus";

/**
 * 扩展 Axios 配置，添加自定义字段
 */
declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
        skipCancelToken?: boolean;  // 跳过防重复检测
        customIndex?: number;       // 分片索引（用于调试）
    }
}

/**
 * --- 【防重复点击相关定义】 ---
 */
const pendingRequests = new Map<string, Canceler>();

// 生成请求唯一的 key
const getRequestKey = (config: InternalAxiosRequestConfig) => {
    // 如果是 FormData（文件上传），不包含 data 在 key 中
    const dataStr = config.data instanceof FormData 
        ? 'formdata' 
        : qs.stringify(config.data);
    
    return [
        config.method, 
        config.url, 
        qs.stringify(config.params), 
        dataStr
    ].join('&');
};

// 移除并取消重复请求
const removePendingRequest = (config: InternalAxiosRequestConfig) => {
    const key = getRequestKey(config);
    if (pendingRequests.has(key)) {
        const cancel = pendingRequests.get(key);
        cancel && cancel("Duplicate request");
        pendingRequests.delete(key);
    }
};

/**
 * 定义刷新令牌期间的请求队列类型
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
    timeout: 60000, // 增加到 60s，大文件上传需要更长时间
    withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
});

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // --- 【关键修改：分片上传跳过防重复检测】 ---
        if (!config.skipCancelToken) {
            removePendingRequest(config);
            config.cancelToken = new axios.CancelToken((c) => {
                pendingRequests.set(getRequestKey(config), c);
            });
        }

        const loginStore = useLoginStore();
        const token = loginStore.token;

        // 1. 自动携带 AccessToken
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 2. 处理数据格式化
        if (config.data instanceof FormData) {
            // 如果是文件上传，删除默认 Content-Type，让浏览器自动设置
            if (config.headers) {
                delete config.headers['Content-Type'];
            }
        } else if (config.method === "post" || config.method === "put") {
            // 普通对象进行序列化
            config.data = qs.stringify(config.data);
        }

        // 3. 调试信息（可选）
        if (config.customIndex !== undefined) {
            console.log(`[分片上传] 索引 ${config.customIndex} 开始请求`);
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
        // --- 【请求成功，从队列中移除 key】 ---
        if (!response.config.skipCancelToken) {
            removePendingRequest(response.config as InternalAxiosRequestConfig);
        }

        // 调试信息（可选）
        const config = response.config as InternalAxiosRequestConfig;
        if (config.customIndex !== undefined) {
            console.log(`[分片上传] 索引 ${config.customIndex} 上传成功`);
        }

        return response;
    },
    async (error) => {
        const { config, response } = error;

        // --- 【如果是主动取消的请求，不弹出错误提示】 ---
        if (axios.isCancel(error)) {
            console.warn("请求重复已拦截:", error.message);
            return new Promise(() => {}); // 返回 pending 状态
        }

        // --- 【请求失败也要移除 key】 ---
        if (config && !config.skipCancelToken) {
            removePendingRequest(config);
        }

        const loginStore = useLoginStore();

        // --- 【核心重构：双 Token 无感刷新逻辑】 ---

        // 1. 如果后端返回 401，代表 AccessToken 过期
        if (response && response.status === 401 && !config._retry) {

            // 如果已经在刷新中了，把当前的请求包装成 Promise 塞进队列挂起
            if (isRefreshing) {
                return new Promise((resolve) => {
                    requestsQueue.push((newToken: string) => {
                        config.headers.Authorization = `Bearer ${newToken}`;
                        resolve(instance(config));
                    });
                });
            }

            // 如果没有在刷新，开启刷新流程
            isRefreshing = true;
            config._retry = true;

            try {
                const refreshRes = await axios.post('/api/refresh', {}, { 
                    withCredentials: true 
                });
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
                ElMessage.error("登录已过期，请重新登录");
                loginStore.token = '';
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // 2. 如果是 403，通常意味着 Token 彻底失效
        if (response && response.status === 403) {
            ElMessage.error("权限验证失败，请重新登录");
            loginStore.token = '';
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
    if (!status) return;
    
    switch (status) {
        case 403: 
            ElMessage.error("拒绝访问"); 
            break;
        case 404: 
            ElMessage.error("请求地址不存在"); 
            break;
        case 500: 
            ElMessage.error("服务器发生意外"); 
            break;
        case 413:
            ElMessage.error("文件过大");
            break;
        default: 
            ElMessage.error(msg || "未知错误");
    }
};

export default instance;