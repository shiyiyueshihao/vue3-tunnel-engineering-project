<template>

    <!-- 顶部导航栏下面的 项目 --  四张卡片 -->
    <div class="card">
        <div class="box">
            <el-icon class="box-icon" style="color:#409EFF">
                <Notification />
            </el-icon>
            <span class="box-text">隧道数量：<span>{{ tunnel }}</span> 个</span> 
        </div>
        <div class="box">
            <el-icon class="box-icon" style="color:#67C23A">
                <Compass />
            </el-icon>
            <span class="box-text">检验合格：<span>{{ check }}</span> 个</span>
        </div>
        <div class="box">
            <el-icon class="box-icon" style="color:#E6A23C">
                <Bell />
            </el-icon>
            <span class="box-text">正在施工：<span>{{ construction }}</span> 个</span>
        </div>
        <div class="box">
            <el-icon class="box-icon" style="color:#A29BFE">
                <Odometer />
            </el-icon>
            <span class="box-text">地质预报：<span>{{ forecast }}</span>个</span>
        </div>
    </div>
    <!--    
        使用 echarts
            1.  定义一个固定宽高的 盒子
            2.  引入  封装好的 方法   全局注册方法
            3.  使用方法  --  拿数据  网络请求  组件加载完毕后使用(onMounted)
     -->
    <div class="echarts">
        <div class="top">
            <div class="echarts-line" id="echarts-line"></div>
        </div>
        <div class="bottom">
            <div class="echarts-radar" id="echarts-radar"></div>
            <div class="echarts-pie" id="echarts-pie"></div>
            <div class="echarts-bar" id="echarts-bar"></div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { Notification, Compass, Bell, Odometer } from "@element-plus/icons-vue"
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref } from "vue";
import api from '@/api/index.ts'

const CurrentInstance = getCurrentInstance()
// console.log(CurrentInstance?.appContext.app.config.globalProperties.$line);
// 定义一个变量存储图表实例
let myChartLine: any = null;
let myChartPie: any = null;
let myChartRadar: any = null;
let myChartBar: any = null;

// 抽取 resize 函数
const handleResize = () => {
    if (myChartLine) {
        myChartLine.resize();
    }
    if (myChartPie) {
        myChartPie.resize();
    }
    if (myChartRadar) {
        myChartRadar.resize();
    }
    if (myChartBar) {
        myChartBar.resize();
    }
};


onMounted(() => {

    // 无论 API 是否请求成功，先给窗口绑定监听器
    window.addEventListener('resize', handleResize);

    api.getEchartsLine().then(res => {
        if (res.data.status === 200) {
            console.log("line的数据为：", res.data);
            myChartLine = CurrentInstance?.appContext.app.config.globalProperties.$line('echarts-line', res.data.result.lines.series)
        }
    }).catch(error => {
        console.log(error)
    })

    api.getEchartsPie().then(res => {
        if (res.data.status === 200) {
            console.log("pie的数据为：", res.data);
            myChartPie = CurrentInstance?.appContext.app.config.globalProperties.$pie('echarts-pie', res.data.result.pies.series)
        }
    }).catch(error => {
        console.log(error)
    })

    //  写死了数据
    myChartRadar = CurrentInstance?.appContext.app.config.globalProperties.$radar('echarts-radar')

    myChartBar = CurrentInstance?.appContext.app.config.globalProperties.$bar('echarts-bar')

})

// 4. 卸载时严格移除
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    // 最好手动释放图表实例，防止内存占用
    if (myChartLine) {
        myChartLine.dispose();
        myChartLine = null;
    }
    // 最好手动释放图表实例，防止内存占用
    if (myChartPie) {
        myChartPie.dispose();
        myChartPie = null;
    }
    if (myChartRadar) {
        myChartRadar.dispose();
        myChartRadar = null;
    }
    if (myChartBar) {
        myChartBar.dispose();
        myChartBar = null;
    }
});


/**
 *     跳动的数据 调整
 *          隧道数量    tunnel
 *          检验合格    check
 *          正在施工    construction
 *          地质预报    forecast
 * 
 */

const tunnel = ref<number>(0)
const check = ref<number> (0)
const construction = ref<number >(0)
const forecast = ref<number>(0)
import { animateCount } from "@/utils/utils";
onMounted(() => {
    animateCount(1000, 2000, tunnel);
    animateCount(805, 2000, check);
    animateCount(302, 2000, construction);
    animateCount(5000, 2000, forecast);

})

</script>

<style scoped lang="scss">
.card {
    display: flex;

    .box {
        flex: 1;
        height: 150px;
        background-color: #fff;
        margin-right: 30px;
        //  子容器处理
        display: flex;
        align-items: center;
        justify-content: center;

        &:last-child {
            margin-right: 0;
        }

        .box-icon {
            font-size: 50px;
            margin-right: 30px;
        }

        .box-text {
            font-size: 18px;
            span{
                font-size: 25px;
                font-weight: 700;
            }
        }
    }

}


.echarts {
    margin-top: 10px;

    .top {
        .echarts-line {
            width: 100%;
            height: 300px;
            background-color: #fff;
        }
    }

    .bottom {
        margin-top: 10px;
        display: flex;

        .echarts-radar {
            flex: 1;
            height: 350px;
            background-color: #fff;
        }

        .echarts-pie {
            margin-left: 20px;
            @extend .echarts-radar
        }

        .echarts-bar {
            @extend .echarts-pie
        }
    }

}
</style>