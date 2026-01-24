<template>
    <div class="tunnelDesign">

        <div class="tree-container">
            <p>选择断面</p>
            <el-tree :props="props" :load="loadNode" lazy @node-click="handleNodeClick" />
        </div>

        <div class="content-container" style="width: 100%;">
            <el-table :data="content.list" stripe>
                <el-table-column prop="name" label="隧道名称" align="center" width="180" />
                <el-table-column prop="drawing_name" label="圈名" align="center" />
                <el-table-column prop="drawing_no" label="图号" align="center" />
                <el-table-column prop="leader" label="负责人" align="center" />
                <el-table-column prop="status" label="状态" align="center" />
                <el-table-column prop="progress" label="施工进度" align="center">
                    <!-- tem + def + sco 那数据 -->
                    <template #default="scope">
                        <el-progress :text-inside="true" :stroke-width="20" :percentage="scope.row.progress" />
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="内容" align="center" show-overflow-tooltip />
                <el-table-column fixed="right" label="编辑" align="center" width="180">
                    <!-- 用 scope 那当前行的数据 -->
                    <template #default="scope">
                        <div class="operation-wrapper" style="display: flex; gap: 10px; justify-content: center;">
                            <!-- <a :href="`http://localhost:3000${scope.row.file_url}`" target="_blank">
                                <el-button type="primary" size="small" v-show="scope.row.file_url">预览</el-button>
                            </a> -->

                            <!-- 文件预览按钮 -->
                            <el-button type="primary" size="small" @click="PreviewHandler(scope.row)"
                                v-show="scope.row.file_url">预览</el-button>

                            <el-button type="primary" size="small" @click="UploadHandler(scope.row)">{{
                                scope.row.file_url ? '替换' : '上传' }}</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 弹出对话框 然后再 上传文件 -->
        <el-dialog v-model="dialogUploadVisible" title="文件上传" width="500" align="center">
            <!--  upload  使用说明 细则
    
                        on-change (文件状态改变时的钩子)：
                            1.只要用户选了文件、或者文件上传成功/失败了，它都会被喊出来。
                            2.用它来感知用户选好了文件，然后配合存好的 唯一ID 去调 API(自定义的API -- 三个参数)。

                        before-upload (上传文件之前的钩子)：
                            1.在文件还没发给后端之前，检查文件大不大（比如超过 10MB 不让传）、
                                格式对不对（只能传图片）。如果这个函数返回 false，上传直接取消。

                        auto-upload (是否自动上传)：默认为 true（选完立刻发请求）。
                            1.要手动调自己的 api.tunnelUpload，所以必须把它设为 false，
                                否则它会绕过逻辑去调 action 里的地址。

                        http-request (覆盖默认上传行为)：
                            自定义请求

                        action (必选参数，上传的地址)：
                            如果 http-request 或者完全手动控制，可以随便填个 # 占位。

                        limit (允许上传的最大数量)：
                            每次只能选x张图，选多了它会报错（触发 on-exceed）。

                        show-file-list (是否显示文件列表)：
                            按钮下面要不要列出你刚才选的文件名。   配合  on-preview
                    
                        on-preview
                            当 show-file-list 为 true 时，文件上传成功后会变成一个蓝色的链接，用户点击那个文件名时触发

                        before-remove
                            删除 之前   点击删除可以做 警告弹窗效果

                        on-remove
                            当文件从显示列表中被删掉后触发 删除完毕可以提示文件已删除  配合  on-preview

                        on-exceed
                            文件超出限制  配合limit   如果用户选择了多于限制个数的数量文件，则会触发

                        disabled (是否禁用)： 
             -->
            <el-upload ref="upload" class="upload-demo" action="#" :limit="1" :show-file-list="true"
                :before-upload="beforeUpload" :auto-upload="false" :on-preview="handlePreview" :on-change="handleChange"
                :on-exceed="handleExceed">
                <!-- 文件上传  需要 在 网络请求中做类型判断并不能格式化不然文件会出错(后端拿不到数据) -->
                <template #trigger>
                    <el-button type="primary">选择文件</el-button>
                </template>
                <el-button class="ml-1" type="success" @click="submitUpload">上传文件</el-button>
                <template #tip>
                    <div class="el-upload__tip text-red">只能上传一份文件，新文件会替换旧文件(限制png、jpg、jpeg、pdf)</div>
                </template>
            </el-upload>
            <el-progress :percentage="progressPercentage" v-if="progressPercentage" style="width: 430px;" />
        </el-dialog>

    </div>

</template>

<script lang="ts" setup>
import api from '@/api'
import type { LoadFunction, UploadProps, UploadInstance, UploadRawFile } from 'element-plus'
//  引入  tree 的 node 的 Node 约束类型  防止调用 level 报错
import type Node from 'element-plus/es/components/tree/src/model/node'
import { reactive, ref } from 'vue'
import { ElMessage, genFileId } from 'element-plus'



interface Tree {
    name: string
    id?: number | undefined; // 唯一ID
    cid?: string | undefined // 一级 ID
    gid?: string | undefined // 二级 ID
    leaf?: boolean
    file_url?: string | null
}

interface dataTree {
    list: Tree[]
}

const props = {
    label: 'name',  //  映射网络的name  渲染到页面的name
    isLeaf: 'leaf',     //  层级
}

//      全局层级 存储 
const nodeLevel = ref<number | null>(null)

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

const nodeInfo = ref()

// @node-click 有三个参数   1. data(数据)   2.node(判断层级)  3.self(实例对象)
const handleNodeClick = (data: Tree, node: Node) => {
    console.log(data)
    console.log("node为:", node);

    console.log(node.level);
    nodeInfo.value = node
    loadRightTable(data, node.level)

}

/**
 *          封装一下 点击列表加载右侧数据 table 的函数
 *              参数  1.  Tree  信息     2.   level 评级
 */
function loadRightTable(data: Tree, level: number) {
    if (level === 1) {
        console.log("1级");
        api.tunnelList().then(res => {
            if (res.data.status === 200) {
                content.list = res.data.result

                //   全局层级赋值
                nodeLevel.value = 1
            } else {
                //  数据为空的时候
                content.list = []
                //   全局层级赋值
                nodeLevel.value = null
            }
        }).catch(err => {
            console.log(err);
        })
    }

    //  二级表
    if (level === 2) {
        console.log("2级");
        //  ts 约束类型  要存在 cid 才可调用接口
        if (data.cid) {
            api.tunnelListChild(data.cid).then(res => {
                if (res.data.status === 200) {
                    content.list = res.data.result

                    //   全局层级赋值
                    nodeLevel.value = 2
                } else {
                    //  数据为空的时候
                    content.list = []
                    //   全局层级赋值
                    nodeLevel.value = null
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }

    //  三级表
    if (level === 3) {
        console.log("3级");
        //  ts 约束类型  要存在 gid 才可调用接口
        if (data.gid) {
            api.tunnelListGrandChild(data.gid).then(res => {
                if (res.data.status === 200) {
                    content.list = res.data.result

                    //   全局层级赋值
                    nodeLevel.value = 3
                } else {
                    //  数据为空的时候
                    content.list = []
                    //   全局层级赋值
                    nodeLevel.value = null
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }
}

/**
 *          文件上传   el组件参数
 * 
 *             
 */
//  定义 唯一 ID  --  1. 数据库查找  2.传参(上传按钮事件传给el-upload)
const fileID = ref<number>(0)

//  定义 对话框的初始状态
const dialogUploadVisible = ref<boolean>(false)

//  初始化文件
const uploadFileInfo = ref()

/** 
 *          上传按钮  触发对话框来上传
 *              这里的 row 可以拿到所有信息
 *              所有信息都可以在这里拿取   
*/
//  存储内容 做无感刷新用
const currentRowData = ref<Tree | null>(null)
//  唯一 id 赋值
//  级别 赋值
function UploadHandler(row: Tree) {
    dialogUploadVisible.value = true
    if (row.id) {
        fileID.value = row.id
    }
    currentRowData.value = row // 把这一行的数据完整存下来
    console.log(row);

}

/** 
 *      上传文件之前( 文件类型校验 )  --  before-upload 
 *          jgp jpeg png pdf   最大为10MB
*/

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
    // 获取后缀名并转小写
    const fileName = rawFile.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));

    // 定义允许的后缀列表
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];

    // 判断逻辑
    if (!allowedExtensions.includes(extension)) {
        ElMessage.error('不是规定类型文件（仅支持 jpg/jpeg/png/pdf/webp）！');
        // 返回 false 会自动触发移除动作
        return false;
    }


    if (rawFile.size / 1024 / 1024 > 500) {
        ElMessage.error('文件不能超过500MB！');
        return false;
    }

    return true;
}



/**
 *              预览
 *                  上传文件 对话框 列表里的文件 点击事件
*/
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {

    console.log("已经加载好准备上传的文件", uploadFile)

}


/** 
 *              on-change 事件
 *                  拿 文件 并 赋值 
 * 
*/

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
    console.log(uploadFile);

    uploadFileInfo.value = uploadFile.raw
}


/**
 *          文件覆盖
 *              设置 limit 和 on-exceed 可以在选中时自动替换上一个文件
*/
const upload = ref<UploadInstance>()
const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}


/**
 *          提交上传 点击按钮之后会做 before-upload 检测  检测完毕之后触发该按钮事件
 */
import { calculateChunksWithHash, calculateFileHash } from '@/utils/utils'

//  上传完成数量
const finishCount = ref<number>(0)
//  文件总数量
const fileCount = ref<number>(0)
//  上传 进度条
const progressPercentage = computed(() => {

    if (fileCount.value === 0) return 0;

    return Math.round((finishCount.value / fileCount.value) * 100);
})

// 是否正在上传
const isUploading = ref<boolean>(false)


//  定义分片小组的类型
interface listInfo {
    index: number,
    hash: string,
    chunk: Blob,    //  文件二进制 
}



/**
 *              web worker 开启/关闭 线程 计算大文件hash 优化速度
 *          1.  进度条之前的 分片等待 await  需要做loading  +  合并之前都需要完全警用上传按钮 
 *          2.  上传关闭就不上传取消 并且全部都清空 -- 这里的逻辑还没做 
 *          3.  大文件上传完毕之后 关闭 的时候 需要刷新页面  也就是重加载  
 *          4.  上传完毕需要做提醒 --  上传成功
 * 
 * 
 */

//  上传成功之后的 处理函数
function successUpload() {
    ElMessage.success('上传成功！');
    // 无感刷新
    console.log("数据为", currentRowData.value, "nodeInfo为", nodeInfo.value);
    if (currentRowData.value && nodeInfo.value) {
        handleNodeClick(currentRowData.value, nodeInfo.value)
    }

    // 上传成功后的清理工作
    dialogUploadVisible.value = false; // 关闭对话框
    uploadFileInfo.value = null;       // 清空临时文件变量
    upload.value!.clearFiles();         // 清除 el-upload 组件界面的显示
}



// 这里的data 就是 scope.row 
const submitUpload = async () => {

    // 防止重复点击
    if (isUploading.value) {
        return ElMessage.warning('正在上传中，请稍候...');
    }

    let nodeType = ""
    if (nodeLevel.value === 2) {
        nodeType = 'child'
    } else if (nodeLevel.value === 3) {
        nodeType = 'grand'
    }

    // 没选文件或者没获取到 ID 则不发请求
    if (!uploadFileInfo.value) {
        return ElMessage.error('请先选择文件！');
    }

    try {

        console.log("准备发送请求：", { id: fileID.value, type: nodeType, file: uploadFileInfo.value });

        /***
         *                  fileID.value  --  sql的主id
         *                  nodeType  --  等级  
         */

        // 大于5MB 做分片
        if (uploadFileInfo.value.size / 1024 / 1024 > 5) {

            const file = uploadFileInfo.value
            console.log(file);

            //  总文件hash  --  用SparkMD5
            const fileHash = await calculateFileHash(file)
            //  所有分片哈希
            const fileChunksHash = await calculateChunksWithHash(file)

            console.log("总文件hash：", fileHash);
            console.log("分片hash：", fileChunksHash);

            //  复制一份 所有分片哈希
            const arr = fileChunksHash

            //  总数量 赋值
            fileCount.value = arr.length
            //  设置每次上传的数量  --  三个
            const chunkSize = 3

            //  每次 收 三个所以步频也是3   i+=3
            for (let i = 0; i < arr.length; i += chunkSize) {

                //  三个分片数据存放地址
                const list: listInfo[] = arr.slice(i, i + chunkSize)

                //  综合 三个任务   需要用map  foreach会返回undefined
                const tasks = (fileHash: string, list: listInfo[]) => {

                    return list.map(element => {
                        return api.tunnelUploadChunk(fileHash, element.index, element.hash, element.chunk).then(res => {
                            console.log("后端返回的内容", res.data);

                            if (res.data.status === 200) {
                                finishCount.value++
                                return res
                            } else {
                                console.error(`分片索引 ${element.index} 处理失败:`, res.data.msg);
                                throw new Error(res.data.msg);
                            }
                        })
                    });

                }

                // 执行并发上传
                const results = await Promise.all(tasks(fileHash, list));

                // 检验
                const isAllSuccess = results.every(response => response?.data.status === 200);

                if (isAllSuccess) {
                    console.log("这一组分片全部校验通过并存储成功");
                } else {
                    console.error("这一组分片中存在处理失败的情况");
                }

                console.log(`第${Math.floor(i / 3) + 1} 组(3片)已完成`);
            }

            console.log("分片全部上传完成，接下来开始合并");

            const res = await api.tunnelMergeChunks({
                hash: fileHash,
                fileName: file.name,
                id: fileID.value,
                type: nodeType
            })

            if (res.data.status === 200) {

                console.log("合并完成");

                successUpload()
            }


        } else if (uploadFileInfo.value.size / 1024 / 1024 <= 5) {
            const res = await api.tunnelUpload(fileID.value, nodeType, uploadFileInfo.value);

            if (res.data.status === 200) {


                console.log("文件存储路径：", res.data.url);
                console.log("成功消息：", res.data.msg);

                // // 无感刷新
                // console.log("数据为", currentRowData.value, "nodeInfo为", nodeInfo.value);
                // if (currentRowData.value && nodeInfo.value) {
                //     handleNodeClick(currentRowData.value, nodeInfo.value)
                // }

                // // 上传成功后的清理工作
                // dialogUploadVisible.value = false; // 关闭对话框
                // uploadFileInfo.value = null;       // 清空临时文件变量
                // upload.value!.clearFiles();         // 清除 el-upload 组件界面的显示
                successUpload()

            } else {
                ElMessage.error(res.data.msg || '服务器返回错误');
            }
        } else {

        }
    } catch (error) {
        console.error("上传接口调用失败：", error);
        ElMessage.error('网络请求异常，请检查后端服务');
    }
}




/**
 *          预览 事件  --  点击触发路由跳转 push 跳转
 *              主
 *                  1.  显示 pdf 还是 图片  等 ，怎么显示 的问题
 *                  2.  如果分开显示 要后端返回文件类型    pdf 用 iframe
 *              次
 *                  2.  重新写个预览接口  --  拿到数据 显示预览按钮
 */

import router from '@/router'

function PreviewHandler(row: Tree) {

    // router.push({
    //     name: "filePrewview",
    //     // params: {
    //     //     fileSrc: fileSrc.value
    //     // },
    //     // 如果你使用 params 传参，必须在 router/index.ts 的 path 中定义占位符（例如 path: 'filePewview/:fileSrc' ），否则刷新页面参数会丢失。
    //     // 更推荐使用 query，因为它就像 URL 里的搜索参数（?fileSrc=xxx），不需要额外配置路由表，且刷新页面参数依然存在。
    //     query: {
    //         fileSrc: row.file_url
    //     }
    // })

    //  优化预览  --  路由跳转  用 resolve 生成一个合法的单页应用URL 用 window原生方法调用
    const routeUrl = router.resolve({
        name: "filePrewview",
        query: {
            fileSrc: row.file_url
        }
    })

    window.open(routeUrl.href, '_blank')

    console.log(row.file_url);
    console.log(routeUrl.href);

}



/**
 *          文件上传   
 *              1.  需要写参数   1.唯一id  2.类型(判断2级还是3级)   3.文件(类型限制)
 *              2.  静态资源访问 
 * 
 *              gemini 3 建议
 *                  1.  Tree 节点的视觉反馈： 既然你打算自己完成前端，可以尝试在 Tree 的 label 旁边
 *                          加一个“小眼睛”图标或者“图片”图标。只有当 file_url 存在时才显示，这样用户
 *                          一眼就能看出哪个分段已经上传了图纸。
 *                  2.  上传后的自动刷新： 当你完成上传接口调用后，记得触发一次 Tree 数据的重新拉取（
 *                          或者局部更新节点数据），这样用户上传完就能立刻看到结果，不用手动刷新页面
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

:deep(.ml-1) {
    margin-left: 20px
}
</style>