import { number } from 'echarts'
import axios from '../utils/request.ts'
import base from './base.ts'

interface PostLoginParams {
    username: string | number,
    password: string | number
}
interface pageParams {
    page: number
}

const api = {
    /**
     *  登录
    */
    getLogin(params: PostLoginParams) {
        // console.log(params)  // 打印测试 显示账号密码说明前端没问题
        return axios.post(base.baseURL + base.login, params)
    },

    /**
     *  用户权限
    */

    getRouter(params: object) {
        return axios.get(base.baseURL + base.router, {
            params
        })
    },

    /**
     *  echarts 图表 line图表
    */
    getEchartsLine() {
        return axios.get(base.baseURL + base.line)
    },

    /**
     *  echarts 图表 pie 图表
    */
    getEchartsPie() {
        return axios.get(base.baseURL + base.pie)
    },

    /**
     *  echarts 图表 pie 图表
    */
    getProjectInfo(params: pageParams) {
        return axios.get(base.baseURL + base.projectInfo, {
            params
        })
    },

    /**
     *  模糊查询
    */
    getSearch(params: any) {
        return axios.get(base.baseURL + base.search, {
            params
        })
    },

    /**
     *  获取数据总条数
    */
    getTotal() {
        return axios.get(base.baseURL + base.total)
    },

    /**
     *  项目基础信息 添加功能
    */
    addFormInfo(params:object) {
        return axios.get(base.baseURL + base.addFormInfo,{
            params
        })
    },
    /**
     *  项目基础信息 删除 功能
    */
    delFormInfo(params:object) {
        return axios.get(base.baseURL + base.delFormInfo,{
            params
        })
    },
    /**
     *  项目基础信息 编辑 功能  --  预更新
    */
    preFormInfo(params:object) {
        return axios.get(base.baseURL + base.preFormInfo,{
            params
        })
    },

}

export default api