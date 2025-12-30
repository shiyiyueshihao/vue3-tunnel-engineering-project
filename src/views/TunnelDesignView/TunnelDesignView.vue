<template>
    <div class="tunnelDesign">
        <div class="tree-container">
            <p>选择断面</p>
            <el-tree :props="props" :load="loadNode" lazy @node-click="handleNodeClick" />
        </div>
        <div class="content-container" style="width: 100%;">
            <el-table :data="content.list" stripe >
                <el-table-column prop="name" label="隧道名称" header-align="center" />
                <el-table-column prop="drawing_name" label="圈名" header-align="center" />
                <el-table-column prop="drawing_no" label="图号" header-align="center" />
                <el-table-column prop="leader" label="负责人" header-align="center" />
                <el-table-column prop="status" label="状态" header-align="center" />
                <el-table-column prop="progress" label="施工进度" header-align="center" />
                <el-table-column prop="content" label="内容" header-align="center" show-overflow-tooltip />
                <el-table-column fixed="right" label="编辑" header-align="center" align="center">
                    <template #default>
                        <el-button  type="primary" size="small" @click="PreviewHandler">预览</el-button>
                        <el-button  type="primary" size="small" @click="UploadHandler">上传</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

    </div>
</template>

<script lang="ts" setup>
import api from '@/api'
import type { LoadFunction } from 'element-plus'
//  引入  tree 的 node 的 Node 约束类型  防止调用 level 报错
import type Node from 'element-plus/es/components/tree/src/model/node'
import { reactive } from 'vue'

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
    console.log(data)
    console.log(node.level);

    //  二级表
    if (node.level === 1) {
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
    if (node.level === 2) {
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

function PreviewHandler() {

}

/**
 *          上传 事件
 */

function UploadHandler() {

}
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
    }

}
</style>