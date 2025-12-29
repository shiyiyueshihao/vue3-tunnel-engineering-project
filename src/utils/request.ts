import axios from "axios"           //  引入axios( 别忘了终端导入依赖 )
import qs from "querystring" // 别忘了安装依赖

import { useLoginStore } from "@/stores/loginStore";

//  创建判断出错点函数
/**
 *  错误处理
 *      根据状态码和具体的错误信息给开发者更明确的错误信息
 *      状态码: 2x(成功) 3x(缓存) 4x(前端错误) 5x(后端错误)
*/
const errorHandler = (status: number, info: string): void => {
    switch (status) {
        case 400:
            console.log("语义错误");
            break;
        case 401:
            console.log("服务器认证失败");
            break;
        case 403:
            console.log("服务器请求拒绝执行");
            break;
        case 404:
            console.log("请检查网路请求地址");
            break;
        case 500:
            console.log("服务器发生意外");
            break;
        case 502:
            console.log("服务器无响应");
            break;
        default:
            console.log(info);
            break;
    }
}
/**
 *  创建 axios 对象
 * 
*/
const instance = axios.create({
    //  这里做公共配置
    baseURL: "/api",               //  公共地址
    timeout: 5000,                                           //  超时配置
    headers: {
        // 补充默认请求头，避免 post 格式化后 contentType 不匹配
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
})
/**
 *  拦截器
 *      发送请求和响应结果之前都可以拦截信息
*/
//  请求拦截
instance.interceptors.request.use(
    //  成功函数
    config => {
        //  config:请求信息  ==>   请求头啊，公共地址啊等
        //  所有的post请求都需要增加一个参数的格式化    ==>  querystring.stringify(  ) 
        if (config.method === "post" || config.method === "put") {
            config.data = qs.stringify(config.data)
        }

        // 自动携带token（结合持久化的token）
        const loginStore = useLoginStore()
        const token = loginStore.token   // 从Pinia获取token
        if (token) {
            // 确保headers存在（避免undefined报错）
            config.headers = config.headers || {}
            // 设置Authorization头（格式按后端要求，这里用Bearer示例）
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    //  失败函数
    error => Promise.reject(error)
)
//  响应拦截
instance.interceptors.response.use(
    //  成功处理
    response => response.status === 200 ? Promise.resolve(response) : Promise.reject(response),
    //  失败处理
    error => {
        const { response } = error
        if (response && response.status === 403) {
            // 这里的 403 对应你后端验证失败的状态
            alert("登录已过期或非法访问，请重新登录");
            const loginStore = useLoginStore();
            loginStore.token = ''; // 清除 Pinia 里的 Token
            localStorage.removeItem('token'); // 清除本地
            window.location.href = '/login'; // 强制跳回登录
        } else {
            console.log("断网了~")
        }

        return Promise.reject(error)
    }
)
//  将 axios 对象 export 出去，不然外部用不了
export default instance