/**
 *      时间戳格式化工具
 *          ProjectInfoView.vue 的 el-table-column 的 :formatter="dataFormater" 需要四个参数
 *              --  这里做了封装 第三个 就是我们需要处理的时间戳
 *                   formatter	    用来格式化内容	  function (row: any, column: TableColumnCtx<T>, cellValue: any, index: number) => VNode | string
 * 
*/
export function dataFormater(row: any | undefined, column: any | undefined, timestamp: any, index: number | undefined) {
  let date = new Date(timestamp)      //  创建实例对象
  const year = date.getFullYear();
  //  为了让  月份和日期 更好看 所以做了 转义+加0调整
  const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1)
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  return `${year}-${month}-${day}`
}


/**
 *      数字上涨动画  
 *          根据 逐帧的渲染 和 持续时间 和 当前 的 时间来算进度条并根据进度条返回进度数据
 *          startTime 起始时间
 *          durationTime 动画时间
 *          startValue  起始值
 *          endValue   终值
 *          currentValue  传入和返回的动态数据
 *          做了缓动动画
 *          判断传入的最终值的  小数点数     --  末尾是 0  没处理 
 */
import { ref, type Ref } from 'vue';

export function animateCount(endValue: Ref<number>, durationTime: number, currentValue: Ref<number>) {

  let startTime: number | null = null;//  定义起始时间为空  --  让系统记住一开始进来的时间
  //  初始数据 是“相对起点”，适合所有场景（包括第一次加载，因为初始值本来就是 0）
  const startValue = currentValue.value;

  //  判断小数点后有几位
  const decimalPlaces = endValue.value.toString().split('.')[1]?.length

  //  timestamp  由  rAF 提供   表当前时间(毫秒级别)
  function step(timestamp: number) {

    if (!startTime) {
      //  第一次  赋值  --  让系统记住一开始进来的时间
      startTime = timestamp
    }

    /**
     *      requestAnimationFrame (简称 rAF)  工具 
     *      理想状态： 动画在 2000ms 结束，此时 elapsed 正好是 2000，2000 / 2000 = 1。
     *      现实状态： 浏览器的帧不是绝对精准的。最后一帧可能发生在 2016.7ms。如果不加限制，计算出的进度就是 2016.7 / 2000 = 1.00835。
    */

    //  算 过去了多少秒
    const elapsed = timestamp - startTime;

    //  算进度条  --  第二次 .... 第n次进来  的时间
    const progress = Math.min(elapsed / durationTime, 1)

    // 缓动函数（让动画先快后慢）
    const easeOut = 1 - Math.pow(1 - progress, 2);

    // 先计算出完整的浮点数值
    const rawValue = startValue + (endValue.value - startValue) * easeOut;

    //改进
    const targetStr = endValue.value.toString();
    const hasDecimal = targetStr.includes('.');
    if (hasDecimal) {
      currentValue.value = Number(rawValue.toFixed(2));
    } else {
      currentValue.value = Math.floor(rawValue)
    }

    // 如果进度还没到 1，就请求下一帧
    if (progress < 1) {
      window.requestAnimationFrame(step);
      // 这行代码的意思是：告诉浏览器，下一次屏幕刷新时，再跑一次 step 函数
    } else {
      console.log("动画结束！");
    }
  }

  // 启动第一帧
  window.requestAnimationFrame(step);

}


import SparkMD5 from 'spark-md5'

/**
 * calculateFileHash: 计算文件总 MD5
 * @param file 原始 File 对象
 * @param chunkSize 切片计算的大小（ 5MB）
 */
export function calculateFileHash(file: File, chunkSize: number = 5 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    // 处理每一块读取完成后的逻辑
    reader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer); // 将二进制数据追加到哈希计算器
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext(); // 继续读下一块
        } else {
          resolve(spark.end()); // 全部读完，返回最终 MD5
        }
      }
    };

    reader.onerror = () => reject("文件读取失败");

    // 发起读取任务
    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      reader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}


/**
 *      分片处理 返回分片数组 (Blob对象数组)
 *          @param file 分片总文件
 */

export function shardHandler(file: File): Blob[] {
  const fileArr: Blob[] = []
  // 将总文件按照5MB分解然后逐个加入
  const chunkSize = 5 * 1024 * 1024
  let cur = 0
  while (cur < file.size) {
    fileArr.push(file.slice(cur, cur + chunkSize));
    cur += chunkSize
  }

  return fileArr
}