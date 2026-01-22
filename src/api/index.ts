import axios from '../utils/request.ts'
import base from './base.ts'

interface PostLoginParams {
    username: string | number,
    password: string | number,
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
     *  退出登录
    */
    logout() {
        // console.log(params)  // 打印测试 显示账号密码说明前端没问题
        return axios.post(base.baseURL + base.login)
    },

    /**
     *  用户权限
    */
    getRouter() {
        return axios.get(base.baseURL + base.router)
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
     *      隧道文件分片上传接口
     *          @param hash 总文件哈希
     *          @param index 当前分片索引
     *          @param chunkHash 当前分片哈希
     *          @param chunkBlob 分片二进制数据
     */
    tunnelUploadChunk(hash: string, index: number, chunkHash: string, chunkBlob: Blob) {
        const formData = new FormData();
        formData.append('hash', hash);
        formData.append('index', String(index));
        formData.append('chunkHash', chunkHash);
        formData.append('file', chunkBlob); // 对应后端 upload.single('file')

        return axios.post(base.baseURL + base.tunnelUploadChunk, formData);
    },
    /**
    *       隧道文件合并接口
    *           @param hash 总文件哈希
    *           @param fileName 用户上传时的原始文件名
    *           @param id 唯一id
    *           @param type 类型 ('child' 或 'grand')
    */
    tunnelMergeChunks(params: { hash: string, fileName: string, id: number, type: string }) {
        // 合并接口不需要 FormData，直接传普通对象即可
        return axios.post(base.baseURL + base.tunnelMergeChunks, params);
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
     *      @param st  第一个起始时间(可不填)  
     *      @param et  第一个下结束时间(可不填)  
     *      @param bd  第三个下拉框内容(可不填)  
     *      @param fx   第四个下拉框内容(可不填)   
     *      @param content  第五个输入框内容(全局模糊查询)   
     *      @param page  页码数  分页查询  
    */
    supervisionSearch(st: string | null | undefined, et: string | null | undefined, bd: string | null | undefined, fx: string | null | undefined, content: string | null, page: number) {
        return axios.get(base.baseURL + base.supervisionSearch, {
            params: {
                st: st || '',       // 对应后端 query.st
                et: et || '',    // 后端代码里接收的是 query.et
                location: bd || '',      // 对应数据库中的 location 字段
                risk: fx || '',          // 对应数据库中的 status 字段 (风险等级)
                search: content || '',    // 对应后端逻辑中的全局搜索关键词,
                page: page,             // 对应后端的page
            }
        })
    },
    /**
     *      工作监督管理 ：动态获取 所有标段
    */
    supervisionSections() {
        return axios.get(base.baseURL + base.supervisionSections)
    },
    /**
     *      工作监督管理 ：动态获取 所有状态
    */
    supervisionStatus() {
        return axios.get(base.baseURL + base.supervisionStatus)
    },

}

export default api