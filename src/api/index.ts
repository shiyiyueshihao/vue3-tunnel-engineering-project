
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
    addFormInfo(params: object) {
        return axios.get(base.baseURL + base.addFormInfo, {
            params
        })
    },
    /**
     *  项目基础信息 删除 功能
    */
    delFormInfo(params: object) {
        return axios.get(base.baseURL + base.delFormInfo, {
            params
        })
    },
    /**
     *  项目基础信息 编辑 功能  --  预更新
    */
    preFormInfo(params: object) {
        return axios.get(base.baseURL + base.preFormInfo, {
            params
        })
    },
    /**
     *  项目基础信息 编辑 功能  --  更新
    */
    updateFormInfo(id: number, params: object) {
        return axios.put(base.baseURL + base.updateFormInfo + id, params)
    },
    /**
     *  隧道设计信息  --  一级
    */
    tunnelList() {
        return axios.get(base.baseURL + base.tunnelList)
    },
    /**
     *  隧道设计信息  --  二级
     * @param cid  一级 的cid
    */
    tunnelListChild(cid: string) {
        return axios.get(base.baseURL + base.tunnelListChild, {
            params: {
                cid: cid
            }
        })
    },
    /**
     *  隧道设计信息  --  三级
     * @param gid  二级 的gid
    */
    tunnelListGrandChild(gid: string) {
        return axios.get(base.baseURL + base.tunnelListGrandChild, {
            params: {
                gid: gid
            }
        })
    },
    /**
     * 隧道设计信息 -- 上传
     * @param id   唯一 id 
     * @param type 类型 ('child' 或 'grand')
     * @param file 文件对象
     */
    tunnelUpload(id: number, type: string, file: File) {
        // 1. 创建 FormData 对象
        const formData = new FormData();

        // 2. 将数据 append 进去
        // 注意：这里的 'file' 必须对应后端 upload.single('file') 里的字符串
        formData.append('id', String(id));
        formData.append('type', type);
        formData.append('file', file);

        // 3. 使用 POST 请求发送
        return axios.post(base.baseURL + base.tunnelUpload, formData);
    },
    /**
     *          工作监督管理 查询总条数
     */
    supervisionTotalCount() {
        return axios.get(base.baseURL + base.supervisionTotalCount)
    },
    /**
     *      工作监督管理 分页查询
     *      @param page  当前页码  --  默认倒序   
    */
    supervisionList(page: number) {
        return axios.get(base.baseURL + base.supervisionList, {
            params: {
                page: page
            }
        })
    },
    /**
     *      工作监督管理 ：组合筛选 + 全局模糊查询
     *      @param bd  第一个下拉框内容(可不填)  
     *      @param fx   第二个下拉框内容(可不填)   
     *      @param content  第三个输入框内容(全局模糊查询)   
    */
    supervisionSearch(bd: string | undefined, fx: string | undefined, content: any) {
        return axios.get(base.baseURL + base.supervisionList, {
            params: {
                location: bd,      // 对应数据库中的 location 字段
                risk: fx,          // 对应数据库中的 status 字段 (风险等级)
                search: content    // 对应后端逻辑中的全局搜索关键词
            }
        })
    },

}

export default api