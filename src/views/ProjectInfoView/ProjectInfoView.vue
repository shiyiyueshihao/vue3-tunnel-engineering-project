<template>

    <!-- 搜索 和 添加 -->
    <div class="search">
        <el-form class="search-form" @submit.prevent :model="projectInfo.list" label-width="auto"
            style="max-width: 600px">
            <el-form-item label="项目状态：" class="search-input">
                <el-input @keyup.enter="onSearch" v-model="searchInfo" placeholder="请输入想要搜索的信息" />
            </el-form-item>
            <el-form-item class="search-button">
                <el-button type="primary" plain @click="onSearch">搜索</el-button>
                <el-button type="primary" plain @click="dialogVisible = true">添加</el-button>
            </el-form-item>
        </el-form>
    </div>

    <!-- projectInfo.list 就是你网络拿到的对象数据 -->
    <el-table :data="projectInfo.list" style="width: 100%;" :stripe="true"
        :header-cell-style="{ backgroundColor: '#e6f7ff', color: '#0050b3', borderColor: '#91d5ff', fontSize: '16px' }">
        <el-table-column prop="name" label="项目名称" width="180" align="center" />
        <el-table-column prop="number" label="项目编码" width="120" align="center" />
        <el-table-column prop="money" label="项目奖金(元)" width="120" align="center" />
        <el-table-column prop="address" label="项目地址" width="150" align="center" />
        <el-table-column prop="duration" label="项目工期(月)" width="120" align="center" />

        <!--  dataFormater 是 Element Plus 表格的一个回调函数，它的运行时机是由 Vue 的渲染机制和 Element Plus 组件库内部控制的 -->
        <el-table-column :formatter="dataFormater" prop="startTime" label="开工时间" width="150" align="center" />
        <el-table-column :formatter="dataFormater" prop="endTime" label="完结时间" width="150" align="center" />

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


    <!-- 对话框 -->
    <el-dialog v-model="dialogVisible" title="添加隧道项目" width="700" :before-close="handleClose" class="demo-form-dialog"
        center>
        <!-- 多个输入框信息开始 -->

        <el-form :model="formInfo" class="demo-form-inline">
            <el-form-item label="项目名称" class="form-item fom-item-1">
                <el-input v-model="formInfo.name" placeholder="请输入名称" clearable class="form-item-input" />
            </el-form-item>
            <el-form-item label="项目编码" class="form-item fom-item-2">
                <el-input v-model="formInfo.code" placeholder="请输入编码" clearable />
            </el-form-item>
            <el-form-item label="项目奖金" class="form-item fom-item-3">
                <el-input v-model="formInfo.money" placeholder="请输入金额(元)" clearable />
            </el-form-item>
            <el-form-item label="项目地址" class="form-item fom-item-4">
                <el-input v-model="formInfo.address" placeholder="请输入地址" clearable />
            </el-form-item>
            <el-form-item label="项目工期" class="form-item fom-item-5">
                <el-input v-model="formInfo.duration" placeholder="请输入工期(月)" clearable />
            </el-form-item>
            <el-form-item label="隧道数量" class="form-item fom-item-6">
                <el-input v-model="formInfo.tunnelNumber" placeholder="请输入数量" clearable />
            </el-form-item>

            <el-form-item label="开工时间" class="form-item fom-item-7">
                <el-date-picker value-format="x" v-model="formInfo.startTime" type="date" placeholder="请选择开工时间"
                    clearable />
            </el-form-item>
            <el-form-item label="完结时间" class="form-item fom-item-8">
                <el-date-picker value-format="x" v-model="formInfo.endTime" type="date" placeholder="请选择完结时间"
                    clearable />
            </el-form-item>


            <el-form-item label="项目状态" class="form-item fom-item-9">
                <el-select v-model="formInfo.status" placeholder="请选择项目状态" clearable>
                    <el-option label="施工中" value="UnderConstruction" />
                    <el-option label="已完结" value="Finished" />
                </el-select>
            </el-form-item>
        </el-form>

        <!-- 多个输入框信息结束 template #footer 必须是 对话框的直接子元素 -->
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addProjectInfo">
                    确定
                </el-button>
            </div>
        </template>



    </el-dialog>
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

//  对话框 默认不显示  --  点击添加 将此改为true
const dialogVisible = ref<boolean>(false)

/**
 *      关闭对话框(不是取消也不是确定)  的处理函数
*/
import { ElMessageBox } from 'element-plus'
const handleClose = (done: () => void) => {
    ElMessageBox.confirm(
        '尚未保存，确定关闭？',
        '提示', // 建议加上标题，显得更正式
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning', // 加上这个会有一个黄色的警告图标，更好看
        }
    )
        .then(() => {
            //  挂载外部的 确定按钮 事件 --  暂时还未完成其功能
            addProjectInfo(formInfo)

            done()
        })
        .catch(() => {
            // 用户点击取消，什么都不做，留在当前页面
        })
}

/**
 *          添加  按钮  核心业务逻辑函数
*/

const formInfo = reactive({
    name: "",
    code: "",
    money: "",
    address: "",
    duration: "",
    startTime: "",
    endTime: "",
    tunnelNumber: "",
    status: ""
})

function addProjectInfo() {
    //  对象的形式添加了 调用API 然后传入对象 属性有很多
    console.log(formInfo);

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

.demo-form-dialog {

    .demo-form-inline {
        margin-top: 10px;
        display: grid;
        //      行 自动填充  每个元素宽度280px
        grid-template-columns: repeat(auto-fill, 280px);
        column-gap: 108px;
        row-gap: 20px;
    }
}
</style>