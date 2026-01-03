/**
 *      echarts 图表库
*/

import type { App } from 'vue';
import * as echarts from 'echarts';

import chinaMapSource from '../assets/json/MapJson/aliyun_chinaMap_100000_full.json';

// 核心：告诉 TS 我们的全局属性里多了一个 $echarts
declare module '@vue/runtime-core' {
  interface ComponentCustomPropertiesLine {
    $line: (elementId: string, data: echarts.EChartsOption) => void;
  }
  interface ComponentCustomPropertiesPie {
    $pie: (elementId: string, data: echarts.EChartsOption) => void;
  }
}

export default {
  install: (app: App) => {
    //  注册一个全局可用的 $line  方法  --  折线图
    //  注册完毕 main.ts 加载完即可使用  getCurrentInstance
    app.config.globalProperties.$line = (elementId: string, data: echarts.EChartsOption) => {
      let myChart = echarts.init(document.getElementById(elementId))
      var option = {
        title: {
          text: '近一周工程产值'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['一期工程', '二期工程', '三期工程'],
          left: "left",
          top: "top",
          orient: 'vertical'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '30%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: data
      }
      myChart.setOption(option)
      return myChart
    };

    //  注册一个全局可用的 $pie  方法  --  饼状图
    //  注册完毕 main.ts 加载完即可使用  getCurrentInstance
    app.config.globalProperties.$pie = (elementId: string, data: echarts.EChartsOption) => {
      let myChart = echarts.init(document.getElementById(elementId))
      var option = {
        tooltip: {
          trigger: 'item', // 饼图必须使用 'item'
          formatter: '{a} <br/>{b}: {c} ({d}%)' // 格式化显示：系列名 <br/>数据名: 数值 (百分比)
        },
        legend: {
          top: 'bottom'
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: data
      }
      myChart.setOption(option)
      return myChart
    };


    //  注册一个全局可用的 $radar  方法  --  雷达图
    //  注册完毕 main.ts 加载完即可使用  getCurrentInstance
    app.config.globalProperties.$radar = (elementId: string) => {
      let myChart = echarts.init(document.getElementById(elementId))
      var option = {
        tooltip: {
          trigger: 'item', // 雷达图同样推荐用 'item'
        },
        title: {
          text: 'Basic Radar Chart'
        },
        legend: {
          data: ['Allocated Budget', 'Actual Spending']
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: 'Sales', max: 6500 },
            { name: 'Administration', max: 16000 },
            { name: 'Information Technology', max: 30000 },
            { name: 'Customer Support', max: 38000 },
            { name: 'Development', max: 52000 },
            { name: 'Marketing', max: 25000 }
          ]
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            data: [
              {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
                name: 'Allocated Budget'
              },
              {
                value: [5000, 14000, 28000, 26000, 42000, 21000],
                name: 'Actual Spending'
              }
            ]
          }
        ]
      }
      myChart.setOption(option)
      return myChart
    };

    //  注册一个全局可用的 $bar  方法  --  柱状图
    //  注册完毕 main.ts 加载完即可使用  getCurrentInstance
    app.config.globalProperties.$bar = (elementId: string) => {
      let myChart = echarts.init(document.getElementById(elementId))
      var option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Direct',
            type: 'bar',
            barWidth: '60%',
            data: [10, 52, 200, 334, 390, 330, 220]
          }
        ]
      }
      myChart.setOption(option)
      return myChart
    };

    //  注册一个全局可用的 $chinaMap  方法  --  柱状图
    //  注册完毕 main.ts 加载完即可使用  getCurrentInstance
    app.config.globalProperties.$chinaMap = (elementId: string) => {
      let myChart = echarts.init(document.getElementById(elementId))
      //  注册地图
      echarts.registerMap("china", chinaMapSource as any)

      var option = {
        //  鼠标点击弹窗
        tooltip: {
          triggerOn: "mousemove",  //  点击触发
          enterable: true  //  是否出现 弹框
        },
        //  图例
        visualMap: {
          origin: "vertical",
          type: "piecewise",
          pieces: [
            { min: 0, max: 10, color: "#fff" },
            { min: 10, max: 20, color: "#fdfdcf" },
            { min: 20, max: 30, color: "#fe9e83" },
            { min: 30, max: 40, color: "#e55a4e" },
            { min: 40, max: 50, color: "#4f070d" },
            { min: 50, max: 100, color: "#ff0000" },
          ]
        },
        series: [{
          name: "中国地图",
          type: "map",
          map: "china",
          roam: true,     //  鼠标滚轮是否可以缩放
          zoom: 1.2, //  默认地图的倍数
          label: {
            show: true,
            fontSize: 13,      //  字体大小
          },
          itemStyle: {
            areaColor: "rgba(255,255,255,1)",
            borderColor: "rgba(0,0,0,0.8)"
          },
          //  依据 json (也可以按照渲染出来的地图样式来)  --  名字对应 值自己写
          data: [
            { name: "内蒙古自治区", value: 80 },
            { name: "黑龙江省", value: 20 },
            { name: "山东省", value: 30 },
            { name: "河南省", value: 40 },
            { name: "四川省", value: 38 },
            { name: "广西壮族自治区", value: 18 },
            { name: "西藏自治区", value: 28 },
          ]
        }]
      }
      myChart.setOption(option)
      return myChart
    }

    //  注册一个全局可用的 $dynamicMap 方法  --  动态渲染地图
    app.config.globalProperties.$dynamicMap = (elementId: string, mapName: string, mapData: any, data: any[] = []) => {
      let myChart = echarts.init(document.getElementById(elementId));

      // 1. 注册地图
      echarts.registerMap(mapName, mapData as any);

      myChart.setOption({
        // 2. 必须包含此配置以确保有视觉映射
        visualMap: {
          type: "piecewise",
         
          show: true,
          left: 'left',
          bottom: '10%'
        },
        series: [{
          type: 'map',
          map: mapName,
          roam: true, // 确保这个设为 true 解决你刚才提到的缩放问题
          label: {
            show: true,
            // 【修改这里】
            fontSize: 16,        // 字体大小，默认通常是 10 或 12
            color: '#333',       // 字体颜色
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,      // 鼠标悬浮在城市上时，字体变得更大
              color: '#000'
            }
          },
          data: data
        }]
      });

      // 3. 响应式处理
      window.addEventListener('resize', () => myChart.resize());

      return myChart;
    };
  }
};