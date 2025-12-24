<template>
    <div id="echarts-chinaMap" class="echarts-chinaMap"></div>
</template>

<script setup lang="ts">

import { getCurrentInstance, onMounted, onUnmounted } from 'vue';


let myChartChinaMap: any = null;
const handleResize = () => {
    if (myChartChinaMap) {
        console.log('图表正在自适应...');
        myChartChinaMap.resize();
    }
};

const CurrentInstance = getCurrentInstance()
console.log(CurrentInstance?.appContext.config.globalProperties.$chinaMap);
onMounted(() => {
    // 无论 API 是否请求成功，先给窗口绑定监听器
    window.addEventListener('resize', handleResize);

    myChartChinaMap = CurrentInstance?.appContext.config.globalProperties.$chinaMap('echarts-chinaMap')
})

// 4. 卸载时严格移除
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    // 最好手动释放图表实例，防止内存占用
    if (myChartChinaMap) {
        myChartChinaMap.dispose();
        myChartChinaMap = null;
    }
})

</script>
<style scoped>
.echarts-chinaMap {
    width: 100%;
    height: 90vh;
    background-color: #fff;
}
</style>