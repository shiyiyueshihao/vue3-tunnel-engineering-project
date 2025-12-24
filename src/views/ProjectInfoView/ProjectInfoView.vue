<template>
    <!-- projectInfo.list 就是你网络拿到的对象数据 -->
    <el-table :data="projectInfo.list" style="width: 100%;">
        <el-table-column prop="name" label="项目名称" width="180" />
        <el-table-column prop="number" label="项目编码" width="120" />
        <el-table-column prop="money" label="项目奖金" width="120" />
        <el-table-column prop="address" label="项目地址" width="150" />
        <el-table-column prop="duration" label="项目工期(月)" width="120" />

        <!--  dataFormater 是 Element Plus 表格的一个回调函数，它的运行时机是由 Vue 的渲染机制和 Element Plus 组件库内部控制的 -->
        <el-table-column :formatter="dataFormater" prop="startTime" label="开工时间" width="150" />
        <el-table-column :formatter="dataFormater" prop="endTime" label="终止时间" width="150" />

        <el-table-column prop="quantity" label="隧道数量" width="120" />

        <!-- template #default="scope" 模板写法 1. 标签 (Tag) 2.气泡提示 (Tooltip) -->
        <el-table-column prop="status" label="项目状态" width="120" >
            <!-- 气泡提示 (Tooltip) -->
            <template #default="scope">
                <el-popover effect="light" trigger="hover" placement="top" width="auto">
                    <template #default>
                        <div>name：{{ scope.row.status === 1 ? '已完结'  : '施工中...'}}</div>
                        <div>address：{{ scope.row.address }}</div>
                    </template>
                    <!-- 标签 (Tag) -->
                    <template #reference>
                        <el-tag>{{ scope.row.status === 1 ? '已完结'  : '施工中...'}}</el-tag>
                    </template>
                </el-popover>
            </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="remark" label="备注" />
    </el-table>
</template>

<script setup lang="ts">

import api from '@/api/index.ts'
import { onMounted, reactive } from 'vue';
//  自己封装工具
import {dataFormater} from '@/utils/utils.ts'

const projectInfo = reactive({
    list: []
})


// const dataFormater = (row: any, column: any, timestamp: any, index: number) => {

//     let date = new Date(timestamp)      //  创建实例对象
//     const year = date.getFullYear();
//     //  为了让  月份和日期 更好看 所以做了 转义+加0调整
//     const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1)
//     const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
//     return `${year}-${month}-${day}`
// }


onMounted(() => {
    api.getProjectInfo({ page: 1 }).then(res => {
        console.log(res.data);
        if (res.data.status === 200) {
            projectInfo.list = res.data.result
        }
    }).catch(err => {
        console.log(err);
    })
})




</script>
<style scoped></style>