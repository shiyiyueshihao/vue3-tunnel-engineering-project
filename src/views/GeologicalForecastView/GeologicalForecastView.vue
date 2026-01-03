<template>
    <div class="map-container">
        <button v-if="isProvince" @click="goBack" class="back-btn">返回全国</button>
        <div id="echarts-chinaMap" class="echarts-chinaMap"></div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue';
// 导入你的两个 JSON 文件
// import chinaMapData from '@/assets/json/MapJson/aliyun_chinaMap_100000_full.json';
import provinceData from '@/assets/json/MapJson/ChineseProvince.json';

// 1. 先定义映射表 (放在最上面)
const getCodeByName = (name: string) => {
    const map: Record<string, string> = {
        '北京市': '110000', '天津市': '120000', '河北省': '130000', '山西省': '140000',
        '内蒙古自治区': '150000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
        '上海市': '310000', '江苏省': '320000', '浙江省': '330000', '安徽省': '340000',
        '福建省': '350000', '江西省': '360000', '山东省': '370000', '河南省': '410000',
        '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000',
        '海南省': '460000', '重庆市': '500000', '四川省': '510000', '贵州省': '520000',
        '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
        '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000',
        '台湾省': '710000', '香港特别行政区': '810000', '澳门特别行政区': '820000'
    };
    const key = Object.keys(map).find(k => k.includes(name) || name.includes(k));
    return key ? map[key] : null;
};
const { proxy }: any = getCurrentInstance();
let myChart: any = null;
const isProvince = ref(false); // 记录当前状态：是全国还是省份

onMounted(() => {
    initChina();
});

//  定义本地数据过滤函数
const filterLocalData = (name: string) => {
    try {
        const geoData: any = topojson.feature(
            provinceData as any, 
            (provinceData as any).objects.default
        );
        // 查找对应省份
        const feature = geoData.features.find((f: any) => 
            name.includes(f.properties.name) || f.properties.name.includes(name)
        );
        if (feature) {
            return { type: "FeatureCollection", features: [feature] };
        }
    } catch (e) {
        console.error('本地数据转换失败', e);
    }
    return null;
};

// 抽取渲染逻辑
const renderMap = (name: string, data: any, isGeo = false) => {
    const geoData = isGeo ? data : topojson.feature(data, data.objects.default);
    const cityData = geoData.features.map((f: any) => ({
        name: f.properties.name,
        value: Math.floor(Math.random() * 100)
    }));
    if (myChart) myChart.dispose();
    myChart = proxy.$dynamicMap('echarts-chinaMap', name, geoData, cityData);
    isProvince.value = true;
};

const goProvince = async (name: string, code: string) => {
    try {
        // 1. 优先尝试从 API 获取数据
        const response = await fetch(`https://geojson.cn/api/china/${code}.topo.json`);
        if (!response.ok) throw new Error('网络请求失败');
        const topoData = await response.json();
        renderMapFromData(name, topoData, false);
    } catch (e) {
        // 2. 如果失败，尝试从你导入的本地 provinceData 过滤
        console.warn(`API 请求失败，正在为 ${name} 尝试本地兜底...`);
        const localData = filterLocalProvince(name);
        if (localData) {
            renderMapFromData(name, localData, true);
        } else {
            console.error('本地数据也不存在该省份');
        }
    }
};

// 辅助函数：从本地 JSON 提取省份数据
const filterLocalProvince = (name: string) => {
    const geoData: any = topojson.feature(provinceData as any, (provinceData as any).objects.default);
    const feature = geoData.features.find((f: any) => name.includes(f.properties.name) || f.properties.name.includes(name));
    return feature ? { type: "FeatureCollection", features: [feature] } : null;
};

// 统一渲染函数，确保 data 永远是数组
const renderMapFromData = (name: string, data: any, isGeoJSON: boolean) => {
    const geoData = isGeoJSON ? data : topojson.feature(data, data.objects.default);
    const cityData = geoData.features.map((f: any) => ({
        name: f.properties.name || '未知区域',
        value: Math.floor(Math.random() * 100)
    }));

    if (myChart) myChart.dispose();
    myChart = proxy.$dynamicMap('echarts-chinaMap', name, geoData, cityData);
    isProvince.value = true;
};

// // 辅助函数：通过省份名匹配 code

// const getProvinceCode = (name: string) => {
//   // 建议在初始化全国地图时，把省份名和 code 的映射关系存起来
//   // 这里做一个简单的映射示例
//   const provinceList = [
//     { name: '江西省', code: '360000' },
//     { name: '青海省', code: '630000' },
//     // ... 其他省份
//   ];
//   const target = provinceList.find(p => name.includes(p.name) || p.name.includes(name));
//   return target ? target.code : null;
// };


import * as topojson from 'topojson-client'; // 引入转换工具

// const filterProvinceJSON = (name: string) => {
//     try {
//         const geoData: any = topojson.feature(
//             provinceData as any, 
//             (provinceData as any).objects.default
//         );

//         // 1. Find the parent province first to get the code prefix
//         const province = geoData.features.find((f: any) => {
//             const jsonName = f.properties.name || "";
//             return name.includes(jsonName) || jsonName.includes(name.replace('省', '').replace('自治区', ''));
//         });

//         if (province && province.properties.code) {
//             // Usually, the first 2 digits of the code represent the province
//             const provincePrefix = province.properties.code.toString().substring(0, 2);

//             // 2. Filter all cities that start with those same 2 digits
//             const cityFeatures = geoData.features.filter((f: any) => {
//                 const code = f.properties.code ? f.properties.code.toString() : "";
//                 // Match the prefix but ensure it's not the exact same code as the province 
//                 // (to avoid overlapping the whole province outline with city pieces)
//                 return code.startsWith(provincePrefix) && code !== province.properties.code.toString();
//             });

//             // 3. If we found cities, return them; otherwise, fallback to the province outline
//             return {
//                 type: "FeatureCollection",
//                 features: cityFeatures.length > 0 ? cityFeatures : [province]
//             };
//         } else {
//             console.error('未在 JSON 中找到该省份或 code 缺失：', name);
//             return null;
//         }
//     } catch (e) {
//         console.error('转换失败', e);
//         return null;
//     }
// };


// 初始化：展示全国地图
// 初始化全国地图
const initChina = () => {
    isProvince.value = false;
    myChart = proxy.$chinaMap('echarts-chinaMap');

    myChart.on('click', (params: any) => {
        // 优先使用 code，如果没有则通过名字匹配
        const code = params.data?.code || getCodeByName(params.name);
        if (code) {
            goProvince(params.name, code);
        }
    });
};

// 返回按钮
const goBack = () => {
    if (myChart) myChart.dispose();
    initChina();
};
</script>


<style scoped>
.map-container {
    position: relative;
}

.back-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
    padding: 5px 15px;
    background: #fff;
    border: 1px solid #ccc;
    cursor: pointer;
}

.echarts-chinaMap {
    width: 100%;
    height: 90vh;
}
</style>