/**
 *      时间戳格式化工具
 *          ProjectInfoView.vue 的 el-table-column 的 :formatter="dataFormater" 需要四个参数
 *              --  这里做了封装 第三个 就是我们需要处理的时间戳
*/
export function dataFormater(row: any, column: any, timestamp: any, index: number) {
    let date = new Date(timestamp)      //  创建实例对象
    const year = date.getFullYear();
    //  为了让  月份和日期 更好看 所以做了 转义+加0调整
    const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1)
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    return `${year}-${month}-${day}`
}