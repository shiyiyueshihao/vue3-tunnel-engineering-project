<template>
    <div class="tunnelDesign">
        <div class="tree-container">
            <p>选择断面</p>
            <el-tree :props="props" :load="loadNode" lazy @node-click="handleNodeClick" />
        </div>
        <div class="content-container" style="width: 100%;">
            <el-table :data="content.list" stripe>
                <el-table-column prop="name" label="隧道名称" header-align="center" />
                <el-table-column prop="drawing_name" label="圈名" header-align="center" />
                <el-table-column prop="drawing_no" label="图号" header-align="center" />
                <el-table-column prop="leader" label="负责人" header-align="center" />
                <el-table-column prop="status" label="状态" header-align="center" />
                <el-table-column prop="progress" label="施工进度" header-align="center" />
                <el-table-column prop="content" label="内容" header-align="center" show-overflow-tooltip />
                <el-table-column fixed="right" label="编辑" header-align="center" align="center" width="150">
                    <!-- 用 scope 那当前行的数据 -->
                    <template #default="scope">
                        <div class="operation-wrapper">
                            <el-button type="primary" size="small" @click="PreviewHandler(scope.row)">预览</el-button>
                            <el-upload class="upload-demo" action="#" :limit="1" :show-file-list="false"
                                :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove"
                                :on-exceed="handleExceed">
                                <el-button type="primary" size="small" @click="UploadHandler(scope.row)">上传</el-button>
                            </el-upload>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>

    </div>
</template>

<script lang="ts" setup>
import api from '@/api'
import type { LoadFunction, UploadProps, UploadUserFile, UploadInstance, UploadRawFile } from 'element-plus'
//  引入  tree 的 node 的 Node 约束类型  防止调用 level 报错
import type Node from 'element-plus/es/components/tree/src/model/node'
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, genFileId } from 'element-plus'

interface Tree {
    name: string
    cid?: string | undefined // 一级 ID
    gid?: string | undefined // 二级 ID
    leaf?: boolean
}

interface dataTree {
    list: Tree[]
}

const props = {
    label: 'name',  //  映射网络的name  渲染到页面的name
    isLeaf: 'leaf',     //  层级
}


/**
 *      懒加载  --  加载数据  只执行一次  tree 树
*/

const loadNode: LoadFunction = (node, resolve) => {

    if (node.level === 0) {
        //  一级标签 网络请求
        api.tunnelList().then(res => {
            if (res.data.status === 200) {
                console.log(res.data.result)
                // content.list = res.data.result
                //  必须 调用 reslove 才能渲染
                resolve(res.data.result)
            }
        })
    } else if (node.level === 1) {
        //  二级标签 网络请求
        // 动态获取当前点击节点的 cid
        const currentCId = node.data.cid
        api.tunnelListChild(currentCId).then(res => {
            if (res.data.status === 200) {
                console.log(res.data.result)
                // content.list = res.data.result
                resolve(res.data.result)
            } else {
                resolve([]) // 没数据传空数组，防止转圈
            }
        })
    } else if (node.level === 2) {
        //  三级标签 网络请求
        // 动态获取当前点击节点的 gid
        const currentGid = node.data.gid
        api.tunnelListGrandChild(currentGid).then(res => {
            if (res.data.status === 200) {
                console.log(res.data.result)
                // content.list = res.data.result
                // 如果这是最后一层，可以在数据里标记 leaf: true
                const data = res.data.result.map((item: any) => ({
                    ...item,
                    leaf: true // 告诉树这是最后一级，不要再显示展开箭头
                }))
                resolve(data)
            } else {
                resolve([])
            }
        })
    }
}

/**
 *          点击列表 加载右侧数据  table
 */

const content: dataTree = reactive({
    list: []
})

// @node-click 有三个参数   1. data(数据)   2.node(判断层级)  3.self(实例对象)
const handleNodeClick = (data: Tree, node: Node) => {
    // console.log(data)
    // console.log(node.level);

    if (node.level === 1) {
        console.log("1级");
        api.tunnelList().then(res => {
            if (res.data.status === 200) {
                content.list = res.data.result
            } else {
                //  数据为空的时候
                content.list = []
            }
        }).catch(err => {
            console.log(err);
        })
    }




    //  二级表
    if (node.level === 2) {
        console.log("2级");
        //  ts 约束类型  要存在 cid 才可调用接口
        if (data.cid) {
            api.tunnelListChild(data.cid).then(res => {
                if (res.data.status === 200) {
                    content.list = res.data.result
                } else {
                    //  数据为空的时候
                    content.list = []
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }

    //  三级表
    if (node.level === 3) {
        console.log("3级");
        //  ts 约束类型  要存在 gid 才可调用接口
        if (data.gid) {
            api.tunnelListGrandChild(data.gid).then(res => {
                if (res.data.status === 200) {
                    content.list = res.data.result
                } else {
                    //  数据为空的时候
                    content.list = []
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }
}


/**
 *          预览 事件
 */

function PreviewHandler(row: Tree) {
    console.log(row);

}

/**
 *          文件上传   el组件参数
 * 
 *              on-change (文件状态改变时的钩子)：
                    1.只要用户选了文件、或者文件上传成功/失败了，它都会被喊出来。
                    2.用它来感知用户选好了文件，然后配合你存好的 row.id 去调 API。

                before-upload (上传文件之前的钩子)：
                    1.在文件还没发给后端之前，检查文件大不大（比如超过 10MB 不让传）、
                    格式对不对（只能传图片）。如果这个函数返回 false，上传直接取消。

                auto-upload (是否自动上传)：默认为 true（选完立刻发请求）。
                    1.要手动调自己的 api.tunnelUpload，所以你必须把它设为 false，
                    否则它会绕过你的逻辑去调 action 里的地址。

                http-request (覆盖默认上传行为)：
                    自定义请求

                action (必选参数，上传的地址)：
                    如果 http-request 或者完全手动控制，可以随便填个 # 占位。

                limit (允许上传的最大数量)：l
                    每次只能选x张图，选多了它会报错（触发 on-exceed）。

                show-file-list (是否显示文件列表)：
                    按钮下面要不要列出你刚才选的文件名。
            
                disabled (是否禁用)：

 */
//  定义文件  初始化
const fileList = ref<UploadUserFile[]>([]);

function UploadHandler(row: Tree) {
    console.log(row);

}


/**
 *      移除文件前 的提示
*/

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
    return ElMessageBox.confirm(
        `取消撤销${uploadFile.name} 文件吗?`
    ).then(
        () => true,
        () => false
    )
}

/**
 *      
*/

const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
    console.log(file, uploadFiles)
}


/**
 * 
*/
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
    console.log(uploadFile)
}


/**
 * 
*/
const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
    ElMessage.warning(
        `只能上传一件文件，你同时选择了 ${files.length} 文件`
    )
}


/**
 *          文件上传   
 *              1.  需要写参数   1.唯一id  2.类型(判断2级还是3级)   3.文件(类型限制)
 *              2.  静态资源访问 需要切割url
 * 
 *              gemini 3 建议
 *                  1.  Tree 节点的视觉反馈： 既然你打算自己完成前端，可以尝试在 Tree 的 label 旁边
 *                          加一个“小眼睛”图标或者“图片”图标。只有当 file_url 存在时才显示，这样用户
 *                          一眼就能看出哪个分段已经上传了图纸。
 *                  2.  上传后的自动刷新： 当你完成上传接口调用后，记得触发一次 Tree 数据的重新拉取（
 *                          或者局部更新节点数据），这样用户上传完就能立刻看到结果，不用手动刷新页面
 * 
 * 
 *              
 * 
*/
</script>
<style scoped lang="scss">
.tunnelDesign {
    display: flex;
    align-items: flex-start; //  让子元素顶部对齐，高度各自独立 

    .tree-container {
        width: 350px;

        p {
            height: 30px;
            line-height: 30px;
            font-size: 20px;
            padding-left: 15px;
            font-weight: 700;
            background-color: #fff;

        }
    }


    .content-container {
        //  Flex 布局中，子元素（el 组件）默认不允许自己的宽度小于其“最小内容宽度”的问题
        min-width: 0;

        background-color: white;
        margin-left: 20px;

        .content-item {
            text-align: center;
            width: 300px;
            font-size: 18px;
            padding: 5px 0;
        }

        .upload-demo {
            display: inline-block;
            padding-left: 5px;
        }
    }

}
</style>