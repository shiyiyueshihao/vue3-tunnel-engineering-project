<template>
    <!-- 搜索 -->
    <div class="search">
        <el-form class="search-form" @submit.prevent :model="projectInfo.list" label-width="auto"
            style="max-width: 600px">
            <el-form-item label="项目状态：" class="search-input">
                <el-input @keyup.enter="onSearch" v-model="searchInfo" placeholder="请输入想要搜索的信息" />
            </el-form-item>
            <el-form-item class="search-button">
                <el-button type="primary" plain @click="onSearch">搜索</el-button>
                <el-button type="primary" plain>添加</el-button>
            </el-form-item>
        </el-form>
    </div>


    <!-- projectInfo.list 就是你网络拿到的对象数据 -->
    <el-table :data="projectInfo.list" style="width: 100%;" :stripe="true"
        :header-cell-style="{ backgroundColor: '#e6f7ff', color: '#0050b3', borderColor: '#91d5ff', fontSize: '16px' }">
        <el-table-column prop="name" label="项目名称" width="180" align="center" />
        <el-table-column prop="number" label="项目编码" width="120" align="center" />
        <el-table-column prop="money" label="项目奖金" width="120" align="center" />
        <el-table-column prop="address" label="项目地址" width="150" align="center" />
        <el-table-column prop="duration" label="项目工期(月)" width="120" align="center" />

        <!--  dataFormater 是 Element Plus 表格的一个回调函数，它的运行时机是由 Vue 的渲染机制和 Element Plus 组件库内部控制的 -->
        <el-table-column :formatter="dataFormater" prop="startTime" label="开工时间" width="150" align="center" />
        <el-table-column :formatter="dataFormater" prop="endTime" label="终止时间" width="150" align="center" />

        <el-table-column prop="quantity" label="隧道数量" width="120" align="center" />

        <!-- template #default="scope" 模板写法 1. 标签 (Tag) 2.气泡提示 (Tooltip) -->
        <el-table-column prop="status" label="项目状态" width="120" align="center">
            <!-- 气泡提示 (Tooltip) -->
            <template #default="scope">
                <el-popover effect="light" trigger="hover" placement="top" width="auto">
                    <template #default>
                        <div>name：{{ scope.row.status === 1 ? '已完结' : '施工中...' }}</div>
                        <div>address：{{ scope.row.address }}</div>
                    </template>
                    <!-- 标签 (Tag) -->
                    <template #reference>
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '已完结'
                            : '施工中...' }}</el-tag>
                    </template>
                </el-popover>
            </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="remark" label="备注" align="center" />

        <!-- 操作系统 -->
        <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
                <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
                    编辑
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="page">
        <el-pagination background layout="prev, pager, next,jumper" :total="totalPages" :default-page-size="15"
            @current-change="pageChangeHandler" />
    </div>

</template>

<script setup lang="ts">

import api from '@/api/index.ts'
import { onMounted, reactive, ref } from 'vue';
//  自己封装工具
import { dataFormater } from '@/utils/utils.ts'

const projectInfo = reactive({
    list: []
})

//      v-model 双向绑定
const searchInfo = ref('')

//  创建分页总数
const totalPages = ref<number>(0)

// const dataFormater = (row: any, column: any, timestamp: any, index: number) => {

//     let date = new Date(timestamp)      //  创建实例对象
//     const year = date.getFullYear();
//     //  为了让  月份和日期 更好看 所以做了 转义+加0调整
//     const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1)
//     const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
//     return `${year}-${month}-${day}`
// }


//  初始获取 第一页数据  --  倒序
onMounted(() => {
    getPagesDate(1)
})

onMounted(() => {
    api.getTotal().then((res) => {
        if (res.data.status === 200) {
            // console.log(res.data.result);           //          [{  0 ：{ count(*) : 41} }]
            // console.log(res.data.result[0]['count(*)']);
            //  一页有 15 条数据 所以向上取整
            totalPages.value = res.data.result[0]['count(*)']
            console.log(totalPages.value);
        } else {
            totalPages.value = 0
        }
    })
})

/**
 *      网络请求封装 后续需要进行第二页第三页操作
*/
function getPagesDate(page: number) {
    api.getProjectInfo({ page }).then(res => {
        console.log(res.data);
        if (res.data.status === 200) {
            projectInfo.list = res.data.result
        }
    }).catch(err => {
        console.log(err);
    })
}


/**
 *      编辑函数
 */

function handleEdit(index: number, row: object) {
    console.log(index, row);

}


/**
 *      删除函数
 */

function handleDelete(index: number, row: object) {
    console.log(index, row);

}


/**
 *        分页处理函数
 */

function pageChangeHandler(value: number) {
    getPagesDate(value)

}


/**
 *      搜索 处理
*/
function onSearch() {
    console.log("触发搜索");
    api.getSearch({ search: searchInfo.value }).then(res => {
        console.log(res.data.result);

        //      如果输入框  的 内容 为 空  则返回第一页数据 这样就OK了
        if (!searchInfo.value) {
            pageChangeHandler(1)
        }

        //      如果输入框有内容  则模糊查询
        if (searchInfo.value) {
            if (res.data.status === 200) {
                projectInfo.list = res.data.result
            } else {
                projectInfo.list = []
            }
        }

    })
}


</script>
<style scoped lang="scss">
.search {
    width: 100%;
    background-color: #fff;
    padding-left: 20px;
    box-sizing: border-box;

    .search-form {
        display: flex;
        height: 50px;
        line-height: 50px;

        .search-input {
            display: flex;
            align-items: center;
            font-weight: 800;
        }
    }
}

.page {
    position: absolute;
    right: 20px;
    // bottom: 100px;
    top: 820px;
}
</style>