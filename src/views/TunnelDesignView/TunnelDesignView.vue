<template>
    <div class="tunnelDesign">
        <div class="tree-container">
            <el-tree  style="width: 350px;" :props="props" :load="loadNode" lazy  />
        </div>
        <div class="content-container">
            <template v-for="(value,index) in content.list" :key="index">
                <p class="content-item">{{ value.name }}</p>
            </template>
        </div>

    </div>
</template>

<script lang="ts" setup>
import api from '@/api'
import type { LoadFunction  } from 'element-plus'
import { reactive } from 'vue'

interface Tree {
    name: string
    cid?: string // 一级 ID
    gid?: string // 二级 ID
    leaf?: boolean
}

interface dataTree {
    list: Tree[]
}

const props = {
    label: 'name',  //  映射网络的name  渲染到页面的name
    isLeaf: 'leaf',     //  层级
}

const content: dataTree = reactive({
    list: []
})


const loadNode: LoadFunction = (node, resolve) => {

    if (node.level === 0) {
        //  一级标签 网络请求
        api.tunnelList().then(res => {
            if (res.data.status === 200) {
                console.log(res.data.result)
                content.list = res.data.result
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
                content.list = res.data.result
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
                content.list = res.data.result
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


</script>
<style scoped lang="scss">
.tunnelDesign {
    display: flex;

    .content-container {

        background-color: white;
        margin-left: 20px;

        .content-item{
            text-align: center;
            width: 300px;
            font-size: 18px;
            padding: 5px 0;
        }
    }

}
</style>