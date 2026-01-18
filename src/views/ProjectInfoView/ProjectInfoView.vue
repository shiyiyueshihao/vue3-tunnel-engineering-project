<template>

    <div class="search-ontainer" ref="searchContainer">
        <!-- 搜索 和 添加 -->
        <div class="search">
            <el-form class="search-form" @submit.prevent :model="projectInfo.list" label-width="auto"
                style="max-width: 600px">
                <el-form-item label="项目状态：" class="search-input">
                    <el-input @keyup.enter="onSearch" v-model="searchInfo" placeholder="请输入想要搜索的信息" clearable
                        style="width: 180px;" />
                </el-form-item>
                <el-form-item class="search-button">
                    <el-button type="primary" plain @click="onSearch">搜索</el-button>
                    <el-button type="primary" plain @click="dialogAddVisible = true">添加</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- projectInfo.list 就是你网络拿到的对象数据 -->
        <el-table :data="projectInfo.list" style="width: 100%;" :stripe="true"
            :header-cell-style="{ backgroundColor: '#e6f7ff', color: '#0050b3', borderColor: '#91d5ff', fontSize: '16px' }">
            <el-table-column prop="name" label="项目名称" width="180" align="center" />
            <el-table-column prop="code" label="项目编码" width="120" align="center" />
            <el-table-column prop="money" label="项目奖金(元)" width="120" align="center" />
            <el-table-column prop="address" label="项目地址" width="150" align="center" />
            <el-table-column prop="duration" label="项目工期(月)" width="120" align="center" />

            <!--  dataFormater 是 Element Plus 表格的一个回调函数，它的运行时机是由 Vue 的渲染机制和 Element Plus 组件库内部控制的 -->
            <el-table-column :formatter="dataFormater" prop="startTime" label="开工时间" width="150" align="center" />
            <el-table-column :formatter="dataFormater" prop="endTime" label="完结时间" width="150" align="center" />

            <el-table-column prop="tunnelNumber" label="隧道数量" width="120" align="center" />

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
                            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ?
                                '已完结'
                                : '施工中...' }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip label="备注" align="center">
                <!-- 模板 渲染 允许 你拿到 当前 的 数据 cope.row(行) -->
                <template #default="scope">
                    <div v-html="scope.row.remark"></div>
                </template>
            </el-table-column>

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
    </div>

    <!-- 分页 -->
    <div class="page">
        <el-pagination background layout="prev, pager, next,jumper" :total="totalPages" :default-page-size="15"
            @current-change="pageChangeHandler" />
    </div>


    <!-- 添加按钮 弹出对话框 rlues 定义规则 -->
    <el-dialog v-model="dialogAddVisible" title="添加隧道项目信息" width="700" :before-close="handleClose"
        class="add-form-dialog" center>
        <!-- 多个输入框信息开始 -->

        <el-form ref="addFormRef" :model="AddFormInfo" class="demo-form-inline" :rules="rules">
            <el-form-item prop="name" label="项目名称" class="form-item fom-item-1">
                <el-input v-model="AddFormInfo.name" placeholder="请输入名称" clearable />
            </el-form-item>
            <el-form-item prop="code" label="项目编码" class="form-item fom-item-2">
                <el-input v-model="AddFormInfo.code" placeholder="请输入编码" clearable />
            </el-form-item>
            <el-form-item prop="money" label="项目奖金" class="form-item fom-item-3">
                <el-input v-model="AddFormInfo.money" placeholder="请输入金额(元)" clearable />
            </el-form-item>
            <el-form-item prop="address" label="项目地址" class="form-item fom-item-4">
                <el-input v-model="AddFormInfo.address" placeholder="请输入地址" clearable />
            </el-form-item>
            <el-form-item prop="duration" label="项目工期" class="form-item fom-item-5">
                <el-input v-model="AddFormInfo.duration" placeholder="请输入工期(月)" clearable />
            </el-form-item>
            <el-form-item prop="tunnelNumber" label="隧道数量" class="form-item fom-item-6">
                <el-input v-model="AddFormInfo.tunnelNumber" placeholder="请输入数量" clearable />
            </el-form-item>

            <el-form-item prop="startTime" label="开工时间" class="form-item fom-item-7">
                <el-date-picker value-format="x" v-model="AddFormInfo.startTime" type="date" placeholder="请选择开工时间"
                    clearable />
            </el-form-item>
            <el-form-item prop="endTime" label="完结时间" class="form-item fom-item-8">
                <el-date-picker value-format="x" v-model="AddFormInfo.endTime" type="date" placeholder="请选择完结时间"
                    clearable />
            </el-form-item>


            <el-form-item prop="status" label="项目状态" class="form-item fom-item-10">
                <!-- <el-select v-model="AddFormInfo.status" placeholder="请选择项目状态" clearable>
                    <el-option label="施工中" value="UnderConstruction" />
                    <el-option label="已完结" value="Finished" />
                </el-select> -->
                <el-input v-model="AddFormInfo.status" placeholder="1：已完结 0：施工中" clearable />
            </el-form-item>
        </el-form>

        <el-form-item label="备注" class="form-item fom-item-9" style="margin-top: 25px;">
            <!-- <el-input v-model="formInfo.remark" placeholder="请输入数量" clearable /> -->
            <TinyMCEEditor @onDataEvent="getTinyMCEEditorData" :disabled="false" class="tinymceEditor" />
        </el-form-item>


        <!-- 多个输入框信息结束 template #footer 必须是 对话框的直接子元素 -->
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogAddVisible = false">取消</el-button>
                <el-button type="primary" @click="addProjectInfo(AddFormInfo, addFormRef)">
                    确定
                </el-button>
            </div>
        </template>

    </el-dialog>



    <!-- 编辑按钮 弹出对话框   destroy-on-close 关闭时 销毁对话框 让他再次渲染触发编辑和富文本框 -->
    <el-dialog  destroy-on-close v-model="dialogEditorVisible" title="编辑隧道项目信息" width="700"
        :before-close="handleClose" class="editor-form-dialog" center>

        <!-- 多个输入框信息开始 -->
        <el-form :model="EditorFormInfo" class="demo-form-inline" :rules="rules">
            <el-form-item prop="name" label="项目名称" class="form-item fom-item-1">
                <el-input v-model="EditorFormInfo.name" placeholder="请输入名称" clearable />
            </el-form-item>
            <el-form-item prop="code" label="项目编码" class="form-item fom-item-2">
                <el-input v-model="EditorFormInfo.code" placeholder="请输入编码" clearable />
            </el-form-item>
            <el-form-item prop="money" label="项目奖金" class="form-item fom-item-3">
                <el-input v-model="EditorFormInfo.money" placeholder="请输入金额(元)" clearable />
            </el-form-item>
            <el-form-item prop="address" label="项目地址" class="form-item fom-item-4">
                <el-input v-model="EditorFormInfo.address" placeholder="请输入地址" clearable />
            </el-form-item>
            <el-form-item prop="duration" label="项目工期" class="form-item fom-item-5">
                <el-input v-model="EditorFormInfo.duration" placeholder="请输入工期(月)" clearable />
            </el-form-item>
            <el-form-item prop="tunnelNumber" label="隧道数量" class="form-item fom-item-6">
                <el-input v-model="EditorFormInfo.tunnelNumber" placeholder="请输入数量" clearable />
            </el-form-item>

            <el-form-item prop="startTime" label="开工时间" class="form-item fom-item-7">
                <el-date-picker value-format="x" v-model="EditorFormInfo.startTime" type="date" placeholder="请选择开工时间"
                    clearable />
            </el-form-item>
            <el-form-item prop="endTime" label="完结时间" class="form-item fom-item-8">
                <el-date-picker value-format="x" v-model="EditorFormInfo.endTime" type="date" placeholder="请选择完结时间"
                    clearable />
            </el-form-item>


            <el-form-item prop="status" label="项目状态" class="form-item fom-item-10">
                <!-- <el-select v-model="EditorFormInfo.status" placeholder="请选择项目状态" clearable>
                    <el-option label="施工中" value="UnderConstruction" />
                    <el-option label="已完结" value="Finished" />
                </el-select> -->
                <el-input v-model="EditorFormInfo.status" placeholder="1：已完结 0：施工中" clearable />
            </el-form-item>
        </el-form>

        <el-form-item label="备注" class="form-item fom-item-9" style="margin-top: 25px;">
            <!-- <el-input v-model="formInfo.remark" placeholder="请输入数量" clearable /> -->
            <!-- 唯一 ID处理  -->
            <TinyMCEEditor :editorID="editorID" @onDataEvent="getTinyMCEEditorData" :disabled="false"
                class="tinymceEditor" />
        </el-form-item>



        <!-- 多个输入框信息结束 template #footer 必须是 对话框的直接子元素 -->
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogEditorVisible = false">取消</el-button>
                <el-button type="primary" @click="EditorProjectInfo(EditorFormInfo)">
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

/**
 *      loading 效果
 */
import { ElLoading } from 'element-plus';
const searchContainer = ref<HTMLDivElement | null>(null)

const loadingOptions = () => {
    return {
        target: searchContainer.value as HTMLDivElement,//  Loading需要覆盖的DOM节点或者选择器字符串，不设置就是全屏
        fullscreen: false,   //  是否全屏，配合target使用
        // lock:true,  //  是否在Loading 出现的时候锁定屏幕滚动(仅全屏时生效)
        text: "正在加载，请稍候",  //    显示在加载图标下方的提示文字
        // spinner:"", //  自定义加载图标的雷鸣，可配合第三方库(FontAwesome)
        background: 'rgba(255, 255, 255, 0.7)',    //  遮罩层的北京颜色
        // svg:"", //  自定义SVG 加载图标(一般可写svg代码)
        // svgViewBox:"",  //  配合 svg 使用的视图盒子属性
        //  修改字体颜色和圈圈颜色在全局配置中设置 App.vue style
    }
}

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
    }).catch(err => {
        console.log(err);
    })
})

/**
 *      网络请求封装 后续需要进行第二页第三页操作
*/
function getPagesDate(page: number) {

    //  loading 加载
    const loadingInstance = ElLoading.service(loadingOptions())

    api.getProjectInfo({ page }).then(res => {
        console.log(res.data);
        if (res.data.status === 200) {
            projectInfo.list = res.data.result
        }
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        //  关闭 loading
        loadingInstance.close()
    })
}



/**
 *      编辑函数  --  特殊  --  数据回显
 */


const dialogEditorVisible = ref<boolean>(false)
const editorID = ref<number>(0)
function handleEdit(index: number, row: rowType) {

    //      数据回显 拿到最新的数据  用 网络请求
    console.log(index, row);
    dialogEditorVisible.value = true
    //  在网络请求之前请求ID 然后先赋值给 富文本 再请求网络赋值给其他
    editorID.value = row.id
    api.preFormInfo({ id: row.id }).then(res => {
        //  拿到网络请求的数据 将这些值赋值给 EditorFormInfo
        if (res.data.status === 200) {
            console.log(res.data.result);
            EditorFormInfo.name = res.data.result.name;
            EditorFormInfo.code = res.data.result.code;
            EditorFormInfo.money = res.data.result.money;
            EditorFormInfo.address = res.data.result.address;
            EditorFormInfo.duration = res.data.result.duration;
            EditorFormInfo.startTime = res.data.result.startTime;
            EditorFormInfo.endTime = res.data.result.endTime;
            EditorFormInfo.tunnelNumber = res.data.result.tunnelNumber;
            EditorFormInfo.status = res.data.result.status;
            // EditorFormInfo.remark = res.data.result.remark;
            //  唯一ID处理  对应 数据库的唯一 ID
            // editorID.value = res.data.result.id

        }
    }).catch(err => {
        console.log(err);
    }).finally(() => {

    })

}


/**
 *      删除函数
 */
//  定义 一下  row  的类型
interface rowType {
    id: number,
    name: string | null,
    code: string | number | null,
    money: number | null,
    address: string | number | null,
    duration: number | null,
    startTime: number | null,
    endTime: number | null,
    tunnelNumber: number | null,
    status: string | null,
    remark: string,
}

function handleDelete(index: number, row: rowType) {
    // console.log(index, row);
    // console.log(row.id);

    ElMessageBox.confirm(
        '删除该数据后无法恢复，确认删除？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {

            //  loading 加载
            const loadingInstance = ElLoading.service(loadingOptions())

            //  这里调用 api  删除 
            api.delFormInfo({ id: row.id }).then(res => {
                console.log(res.data);
                // 删除陈工之后 给个提示框 和 刷新
                pageChangeHandler(1)
                ElMessage({
                    type: 'success',
                    message: '删除成功',
                })
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                //  关闭 loading
                loadingInstance.close()
            })

        })
        .catch(() => {
            //  取消删除什么都不做
            ElMessage({
                type: 'info',
                message: '您已取消删除',
            })
        })
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

    //  loading 加载
    const loadingInstance = ElLoading.service(loadingOptions())

    console.log("触发搜索");
    api.getSearch({ search: searchInfo.value }).then(res => {
        // console.log(res.data.result);

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

    }).catch(err => {
        console.log(err);
    }).finally(() => {
        //  关闭 loading
        loadingInstance.close()
    })
}

//  对话框 默认不显示  --  点击添加 将此改为true
const dialogAddVisible = ref<boolean>(false)

/**
 *      关闭对话框(不是取消也不是确定)  的处理函数
*/
import { ElMessageBox } from 'element-plus'
const handleClose = (done: () => void) => {
    ElMessageBox.confirm(
        '表单未提交，确定关闭？',
        '提示', // 建议加上标题，显得更正式
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning', // 加上这个会有一个黄色的警告图标，更好看
        }
    )
        .then(() => {
            pageChangeHandler(1)
            done()
        })
        .catch(() => {
            // 用户点击取消，什么都不做，留在当前页面
        })
}

/**
 *          添加  按钮  核心业务逻辑函数
*/

//  定义表格接口 
interface infoType {
    name: string | null,
    code: string | number | null,
    money: number | null,
    address: string | number | null,
    duration: number | null,
    startTime: number | null,
    endTime: number | null,
    tunnelNumber: number | null,
    status: string | null,
    remark: string,
}

//  添加 表格 初始化
const AddFormInfo: infoType = reactive({
    name: "",
    code: "",
    money: null,
    address: "",
    duration: null,
    startTime: null,
    endTime: null,
    tunnelNumber: null,
    status: "",
    remark: "",
})

//  添加按钮 核心业务逻辑函数
import { ElMessage } from 'element-plus'
function addProjectInfo(value: infoType, typeInfo: FormInstance | undefined) {
    /**
     *      数据校验  --  通过 表单 的ref 绑定 addFormRef  与 按钮  事件传输 addFormRef  和  FormInstance  el组件身份证明  和 typeInfo.validate 的 集体校验
     *              1.  表单写入 :rules="rules"  和  定义  rules  的  校验方式   const rules = reactive({....})
     *              2.  表格项   的 prop="" 的 值 必须 对应 rules 里 的  键 
     *              3.  表单绑定  ref="addFormInfo"
     *              4.  定义  表单的  ref 为  FormInstance 
     *              5.  引入  FormInstance       import type { FormInstance } from 'element-plus';
     *              6.  验证
     *                      6.1     typeInfo.validate  集体校验
     *                      6.2     集体校验触发 rules  校验
     *              7.  增加 时间校验
     *                      7.1     开始时间  不能 大于 结束时间
    */

    if (!typeInfo) return;

    typeInfo.validate((valid) => {
        if (valid) {

            // console.log(value);
            //   时间 校验  逻辑
            if (value.startTime && value.endTime && value.startTime > value.endTime) {
                ElMessage({
                    message: '开始时间不能晚于完工时间 ！',
                    type: 'warning',
                })
            } else {


                //  loading 加载
                const loadingInstance = ElLoading.service(loadingOptions())

                api.addFormInfo(value).then(res => {
                    console.log(res.data);
                    if (res.data.status === 200) {
                        //  1.将 这个 对话框隐藏   2.将 页面刷新(可以调用一次查询接口)
                        dialogAddVisible.value = false
                        pageChangeHandler(1)

                        ElMessage({
                            message: '数据添加成功 !',
                            type: 'success',
                        })
                    }

                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    //  关闭 loading
                    loadingInstance.close()
                })
            }

        } else {
            ElMessage({
                message: '填写信息有误请审查!.',
                type: 'warning',
            })
        }

    });


}

/**
 *              富文本编辑器 使用
 */
// @ts-ignore
import TinyMCEEditor from '@/components/TinyMCEEditor/TinyMCEEditor.vue';

/**
 *              获取富文本编辑
 */

function getTinyMCEEditorData(data: any) {
    console.log(data);
    //  表明 是 在进行添加 
    if (dialogAddVisible.value === true) {
        AddFormInfo.remark = data
    }
    //  表明 是 在进行编辑
    if (dialogEditorVisible.value === true) {
        EditorFormInfo.remark = data
    }

}

/**
 *              编辑按钮  --  特殊  --  数据回显
 */

const EditorFormInfo: infoType = reactive({
    name: "",
    code: "",
    money: null,
    address: "",
    duration: null,
    startTime: null,
    endTime: null,
    tunnelNumber: null,
    status: "",
    remark: "",
})

//  编辑确定按钮 
function EditorProjectInfo(value: infoType) {
    //  两个参数  1.  唯一id  --  我们编辑的时候能拿到 唯一 id    2. 文档数据( 编辑 的内容 )

    //  开启 loading
    const loadingInstance = ElLoading.service(loadingOptions())

    api.updateFormInfo(editorID.value, {
        //  传的数据 来源于 编辑的视图数据
        name: EditorFormInfo.name,
        code: EditorFormInfo.code,
        money: EditorFormInfo.money,
        address: EditorFormInfo.address,
        duration: EditorFormInfo.duration,
        startTime: EditorFormInfo.startTime,
        endTime: EditorFormInfo.endTime,
        tunnelNumber: EditorFormInfo.tunnelNumber,
        status: EditorFormInfo.status,
        remark: EditorFormInfo.remark,                  ///     富文本编辑器中的 数据 
    }).then(res => {
        if (res.data.status === 200) {
            ElMessage({
                message: '数据修改成功 !',
                type: 'success',
            })
            //  关闭 编辑框
            dialogEditorVisible.value = false
            //  搜索第一页
            getPagesDate(1)
        }
    }).catch(err => {
        console.log(err);
        ElMessage({
            message: '数据修改失败 !',
            type: 'warning',
        })
    }).finally(() => {
        //  关闭 loading
        loadingInstance.close()
    })
}



/**
 *        表格校验   数字校验 
 * 
*/
//  引入 类型 做校验
import type { FormInstance } from 'element-plus';

//  定义 校验 规则
const rules = reactive({
    // 1. 项目名称：必填，文本校验
    name: [
        { required: true, message: '项目名称不能为空', trigger: 'blur' },
        { min: 2, max: 50, message: '名称长度需在 2 到 50 个字符之间', trigger: 'blur' }
    ],

    // 2. 项目编码：必填，通常为大写字母和数字组合
    code: [
        { required: true, message: '项目编码不能为空', trigger: 'blur' },
        { pattern: /^[A-Z0-9-]+$/, message: '编码只能包含大写字母、数字或横杠', trigger: 'blur' }
    ],

    // 3. 钱 (元)：必须是数字，且不能为负数
    money: [
        { required: true, message: '请输入金额', trigger: 'blur' },
        { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请输入正确的金额格式（数字，最多两位小数）', trigger: 'change' }
    ],

    // 4. 项目地址：必填文本
    address: [
        { required: true, message: '项目地址不能为空', trigger: 'blur' }
    ],

    // 5. 项目工期 (月)：必须是正整数
    duration: [
        { required: true, message: '请输入工期', trigger: 'blur' },
        { pattern: /^[1-9][0-9]*$/, message: '工期必须是大于 0 的整数', trigger: 'blur' }
    ],

    // 6. 隧道数量：必须是数字
    tunnelNumber: [
        { required: true, message: '请输入隧道数量', trigger: 'blur' },
        { pattern: /^[0-9]+$/, message: '数量必须为纯数字', trigger: 'blur' }
    ],

    // 7. 状态：只能是 1 或 0
    status: [
        { required: true, message: '请选择状态', trigger: 'blur' },
        // 这里的正则表达式限制只能输入 0 或 1
        { pattern: /^[01]$/, message: '状态值非法，只能输入 0 或 1', trigger: 'blur' }
    ],

    // 8&9. 时间 必填
    startTime: [
        { required: true, message: '请选择开始日期', trigger: 'change' },
    ],
    endTime: [
        { required: true, message: '请选择完结日期', trigger: 'change' },
    ],
})
/**
 *          添加  校验  类型定义
*/

const addFormRef = ref<FormInstance>()

/**
 *          编辑  校验  类型定义
*/

const editFormRef = ref<FormInstance>()


</script>
<style scoped lang="scss">
.search-ontainer {
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

}

.page {
    position: absolute;
    right: 20px;
    // bottom: 100px;
    top: 865px;
}

.add-form-dialog {

    .demo-form-inline {
        margin-top: 10px;
        display: grid;
        //      行 自动填充  每个元素宽度280px
        grid-template-columns: repeat(auto-fill, 280px);
        column-gap: 108px;
        row-gap: 25px;

    }
}

.editor-form-dialog {
    @extend .add-form-dialog
}
</style>