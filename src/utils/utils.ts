/**
 *      时间戳格式化工具
 *          ProjectInfoView.vue 的 el-table-column 的 :formatter="dataFormater" 需要四个参数
 *              --  这里做了封装 第三个 就是我们需要处理的时间戳
 *                   formatter	    用来格式化内容	  function (row: any, column: TableColumnCtx<T>, cellValue: any, index: number) => VNode | string
 * 
*/
export function dataFormater(row: any|undefined, column: any|undefined, timestamp: any, index: number | undefined) {
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

export function animateCount(endValue: number, durationTime: number, currentValue: Ref<number>) {

    let startTime: number | null = null;//  定义起始时间为空  --  让系统记住一开始进来的时间
    //  初始数据 是“相对起点”，适合所有场景（包括第一次加载，因为初始值本来就是 0）
    const startValue = currentValue.value;

    //  判断小数点后有几位
    const decimalPlaces = endValue.toString().split('.')[1]?.length

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
        const rawValue = startValue + (endValue - startValue) * easeOut;

        //  经实验 不能这么写 因为动画会做很长的小数点跳动
        // currentValue.value = rawValue
        //    判断 endValue 是否为小数
        if (decimalPlaces === 1) {
            // 如果是小数：保留两位小数并转回数字
            // 使用 parseFloat 配合 toFixed 可以去掉末尾多余的 0（比如 96.50 变成 96.5）
            currentValue.value = parseFloat(rawValue.toFixed(1));
        } else if (decimalPlaces === 2) {
            currentValue.value = parseFloat(rawValue.toFixed(2));
        } else {
            // 如果是整数：直接向下取整
            currentValue.value = Math.floor(rawValue);
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