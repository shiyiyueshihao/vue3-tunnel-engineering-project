<template>
    <div class="work-container">

        <!-- 卡片 -->
        <div class="card-container">
            <el-card :class="`card-${item.name}`" style="width: 880px" shadow="always"
                v-for="(item, index) in cardData.list" :key="index">
                <div :class="`${item.name}-iconfont`">
                    <!-- <div class="blue-radius"></div> -->
                    <span :class="`iconfont  ${item.iconName}`"></span>
                </div>
                <div :class="`${item.name}-content`">
                    <p class="text">{{ item.text }}</p>
                    <p class="num">{{ item.num }}</p>
                    <p class="remark">{{ item.remark }}</p>
                </div>
            </el-card>
        </div>

        <!-- 表格与输入框 -->
        <div class="table-container">
            <!-- 上面的 搜索查询等内容 -->
            <div class="top-container" style="display: flex; gap: 20px;text-align: center;">
                <!-- 时间选择器 -->
                <el-date-picker class="demo-datetime-picker" style="flex: 4;" v-model="value1" type="daterange"
                    range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
                <div style="flex: 2; display: flex;">
                    <div style="width: 50px; font-size: 15px; height: 32px; line-height: 32px; margin-right: 10px;">标段
                    </div>
                    <el-select-v2 v-model="value2" :options="sectionOptions1"
                        placeholder=" 标段" clearable />
                </div>
                <div style="flex: 2;">
                    <el-select-v2 v-model="value3" :options="sectionOptions2" placeholder="状态" clearable />
                </div>
                <div style="flex: 2;">
                    <el-input v-model="input" placeholder="请输入内容" clearable />
                </div>
                <div style="flex: 1;">
                    <el-button type="primary" @click="searchInfo">查询</el-button>
                </div>
                <div style="flex: 1; position: relative;">
                    <el-button type="warning" @click="resertInfo" style='position: absolute;left: 0;'>重置</el-button>
                </div>
                <div style="flex: 2;">
                    <el-button type="primary">下达整改通知单</el-button>
                </div>
                <div style="flex: 2;">
                    <el-button style="">发起现场巡检</el-button>
                </div>
                <div style="flex: 2;">
                    <el-button style="">导出监督周报</el-button>
                </div>
            </div>
            <!-- 下面的table 表格渲染 -->
            <div class="bottom-container" style="margin-top: 20px;">
                <!-- 当 el-table 元素中注入 data 对象数组后，在 el-table-column 中用 prop 属性来对应对象中
                 的键名即可填入数据，用 label 属性来定义表格的列名。 可以使用 width 属性来定义列宽。 -->
                <el-table :data="tableData.list" stripe style="width: 100%;" size="large"
                    :header-cell-style="{ background: '#f5f7fa', color: '#000', fontSize: '18px' }">
                    <el-table-column prop="task_no" label="任务编号" />
                    <el-table-column prop="location" label="工程部位" show-overflow-tooltip />
                    <el-table-column prop="supervision_type" label="监督类型" show-overflow-tooltip />
                    <el-table-column prop="responsible_unit" label="责任单位" show-overflow-tooltip />
                    <el-table-column prop="status" label="当前状态" />
                    <el-table-column prop="update_time" label="更新时间" />
                    <el-table-column prop="report_url" label="操作">
                        <!-- 做有无路径的渲染 -->
                    </el-table-column>
                </el-table>
            </div>
            <!-- page分页 -->
            <el-pagination class="page" v-model:current-page="currentPage3" v-model:page-size="pageSize3" :size="size"
                :disabled="disabled" :background="background" layout="prev, pager, next, jumper" :total="totalCount"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import api from '@/api/index.ts'
/**
 *          定义 卡牌内容 方便渲染数据
 */

const cardData = reactive({
    list: [
        {
            name: "blue",
            text: "本月监督计划",
            num: 1250,
            remark: "任务总数",
            iconName: "icon-yiwanchengshijian"
        },
        {
            name: "orange",
            text: "待办监督项",
            num: 35,
            remark: "今日待核查",
            iconName: "icon-yiwanchengshijian"
        },
        {
            name: "red",
            text: "未闭环隐患",
            num: 18,
            remark: "逾期未整改",
            iconName: "icon-sanjiaogantanhao"
        },
        {
            name: "green",
            text: "监督合格率",
            num: "96.5%",    //  这个可能需要你算 现在写死吧
            remark: "质量受控水平",
            iconName: "icon-yewu_hege"
        },
    ]
})


/**
 *          定义 时间默认起始   
 *              时间 参数  value1
*/
// 建议修改为 null，而不是 ["", ""]
const value1 = ref<[Date, Date] | null>(null);

// 定义起始时间变量，初始值给空字符串或 undefined
const startTime = ref<string>("");
const endTime = ref<string>("");
/**
 *          拿到的是
 *               {0: Thu Jan 01 2026 00:00:00 GMT+0800 (中国标准时间), 
 *               1: Sat Jan 10 2026 00:00:00 GMT+0800 (中国标准时间)}
 *          正好我们封装了一下这个时间处理的文件 拿来用
 */
import { dataFormater } from '@/utils/utils.ts'
console.log(value1.value);

function DataFormaterHandler(va: any) {
    // 增加判断：如果 va.value 为空，直接清空时间并返回，不要读取 [0]
    if (!va.value || va.value.length < 2) {
        startTime.value = "";
        endTime.value = "";
        return;
    }
    //  用函数处理一下拿结果  --  先出处理默认的结果
    startTime.value = dataFormater(undefined, undefined, va.value[0], undefined)
    endTime.value = dataFormater(undefined, undefined, va.value[1], undefined)
    //  2026-1-1     2026-1-10
    console.log("起始时间", startTime.value, "结束时间", endTime.value);
}

DataFormaterHandler(value1)

//  监听 时间  变化  
watch(value1, (newValue, oldValue) => {
    console.log("起始时间 新", newValue);
    //  变化  再次调用
    DataFormaterHandler(value1)
})

/**
 *          定义选择器1
 *              标段
 */

const value2 = ref()
// 模拟后端返回的数据
const rawSections = reactive({
    list: [] as string[]
})


// 用 computed 监测 用 map 转换
const sectionOptions1 = computed(() => {
    return rawSections.list.map(item => ({
        label: item + " 标段",
        value: item
    }));
})

//  获取所有标段
api.supervisionSections().then(res => {
    if (res.data.status === 200) {
        console.log("所有标段为：", res.data);
        rawSections.list = res.data.result
    }
}).catch(err => {
    console.log(err);
})


/**
 *          定义选择器2
 *              状态
 */
const value3 = ref()

//  定义风险等级
const dangerLevel = reactive({
    list: [] as string[]
})

// 使用 map 转换
const sectionOptions2 = computed(() => {
    return dangerLevel.list.map(item => ({
        label: item,
        value: item
    }));
})
//  获取所有状态
api.supervisionStatus().then(res => {
    if (res.data.status === 200) {
        console.log("所有状态为：", res.data);
        dangerLevel.list = res.data.result
    }
}).catch(err => {
    console.log(err);
})


/**
 *          定义 输入框
 *              输入框
*/

const input = ref('')



/**
 *          定义表格数据
*/

interface tableDataListType {
    id?: number,
    task_no?: string | undefined,
    location?: string | undefined,
    supervision_type?: string | undefined,
    responsible_unit?: string | undefined,
    status?: string | undefined,
    update_time?: any | undefined,
    report_url?: string | undefined
}

interface tableDataType {
    list: tableDataListType[]
}

const tableData: tableDataType = reactive({
    list: []
})

//  获取 数据总条数
const totalCount = ref<number | undefined>(0)

//  初始数据渲染函数
function initDataRander() {
    api.supervisionTotalCount().then(res => {
        if (res.data.status === 200) {
            console.log(res.data);

            totalCount.value = res.data.total
        }
    })

    //  页面加载 初始化 一次 表格
    api.supervisionList(1).then(res => {
        if (res.data.status === 200) {
            console.log(res.data.result);

            tableData.list = res.data.result
        }
    }).catch(err => {
        console.log(err);
    })
}


onMounted(() => {
    //  初始数据渲染一下
    initDataRander()
})


/**
 *          分页
 */

import { ElMessage, type ComponentSize } from 'element-plus'

const currentPage3 = ref(1)

const pageSize3 = ref(8)

//  设置尺寸 --  分页大小
const size = ref<ComponentSize>('large')
const background = ref(false)
const disabled = ref(false)

const handleSizeChange = (val: number) => {
    console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
    console.log(val)
    //  分页查询
    api.supervisionList(val).then(res => {
        if (res.data.status === 200) {
            console.log(res.data.result);

            tableData.list = res.data.result
        }
    }).catch(err => {
        console.log(err);
    })
}


/**
 *          查询按钮点击事件
 *              startTime    开始时间
 *              endTime     结束时间
 *              value2         标段
 *              value3         状态
 *              input           输入框内容
*/
function searchInfo() {

    // 1. 提取核心判断条件 (过滤掉 null, undefined, 和空字符串)
    const hasTime = startTime.value && startTime.value !== 'undefined' && startTime.value !== '';
    const hasSection = value2.value !== null && value2.value !== undefined && value2.value !== '';
    const hasStatus = value3.value !== null && value3.value !== undefined && value3.value !== '';
    const hasInput = input.value && input.value.trim() !== '';

    // 如果全是空的，直接拦截，不发请求
    if (!hasTime && !hasSection && !hasStatus && !hasInput) {
        //  初始数据渲染一下
        initDataRander()
        ElMessage({
            message: '请选择或输入查询条件', // 提示语建议改为这个，更符合语境
            type: 'warning',
        });
        return;
    }
    //  查询 请求 
    api.supervisionSearch(startTime.value, endTime.value, value2.value, value3.value, input.value).then(res => {
        if (res.data.status === 200) {
            console.log(value2.value);
            //  有数据
            if (res.data.result && res.data.result.length > 0) {
                //  这个就是 查询之后的总长度
                console.log(res.data.total);

                totalCount.value = res.data.total

                console.log(res.data.result);
                tableData.list = res.data.result

                ElMessage({
                    message: '查询成功',
                    type: 'success',
                })
            } else {
                tableData.list = []
                ElMessage({
                    message: '数据为空',
                    type: 'warning',
                })
            }
        }

    }).catch(err => {
        console.log(err);
        ElMessage({
            message: '请输入有效信息',
            type: 'warning',
        })
    })
}


/** 
 *      重置 按钮 事件
*/

function resertInfo() {

    // 清空所有内同
    startTime.value = ''
    endTime.value = ''
    value1.value =null
    value2.value = ''
    value3.value = ''
    input.value = ''

    //  初始数据渲染一下
    initDataRander()
}


</script>

<style scoped lang="scss">
//  引入 iconfonts 里的 样式 
@import url('../../assets/iconfonts/workCardIcon/iconfont.css');

// 定义卡片 通用  灵活  混合 样式
@mixin status-card($name, $border-clolr, $iconfont-color, $brfore-bgcolor) {
    .card-#{$name} {
        border-left: 0.42vw solid $border-clolr;

        // el-card__body  display:flex  才能让内部实现flex布局
        .#{$name}-iconfont {
            margin-left: 0.5vw;
            height: 4.17vw;
            line-height: 4.17vw;
            box-sizing: border-box;

            .iconfont {
                font-size: 4.17vw;
                color: $iconfont-color;

                &::before {
                    border-radius: 50%;
                    background-color: $brfore-bgcolor;
                }
            }

        }

        .#{$name}-content {
            margin-left: 1.56vw;
            box-sizing: border-box;

            .text {
                font-size: 1.1vw;
                height: 1.1vw;
                line-height: 1.1vw;
                font-weight: 700;
            }

            .num {
                padding-top: 0.5vw;
                height: 2.1vw;
                line-height: 2.1vw;
                font-size: 2.1vw;
                font-weight: 700;
                padding-bottom: 0.5vw;
                font-family: "楷体";
            }

            .remark {
                color: rgb(194, 192, 192);
                // font-size: 13px;
                font-size: 0.7vw;
                font-weight: 700;
            }
        }

    }
}

.work-container {
    width: 100%;
    margin: 20px auto 0 auto;
    // background-color: #fff;

    // 卡片样式
    .card-container {
        height: 150px;
        gap: 20px;

        display: flex;

        //  蓝色卡片  -- include 混合使用
        @include status-card("blue", #3C88E0, #388AF6, #DEECFC);
        //  橙色卡片
        @include status-card("orange", #E79248, #FD9031, #FAEEDF);
        //  红色卡片
        @include status-card("red", #DE4C50, #EC605A, #FBE6E5);
        //  绿色卡片
        @include status-card("green", #47B180, #34B77E, #E2F6EA);


    }

    // 
    .table-container {
        height: 600px;

        background-color: #fff;
        padding-top: 20px;
        box-sizing: border-box;
        margin-top: 20px;
        border-radius: 0.5vw;
        position: relative;

        .top-container {
            width: 98%;
            margin: 0 auto;
            margin-bottom: 0.5vw;

        }

        .bottom-container {
            height: 400px;

            width: 98%;
            margin: 0 auto;
            // background-color: green;
            border-radius: 0.5vw;
            margin-bottom: 0.5vw;
        }

        .page {

            border-radius: 0.5vw;
            position: absolute;
            bottom: 10px;
            right: 20px;
        }

    }
}

//  分页 样式
.demo-pagination-block+.demo-pagination-block {
    margin-top: 10px;
}

.demo-pagination-block .demonstration {
    margin-bottom: 16px;
}
</style>