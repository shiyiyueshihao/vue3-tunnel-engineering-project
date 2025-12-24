export default {
    pies: {
        series: [
            {
                name: '标段统计',
                type: 'pie',
                radius: [50, 120],
                center: ['50%', '50%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 8
                },
                data: [
                    { value: 40, name: '一标段' },
                    { value: 38, name: '二标段' },
                    { value: 32, name: '三标段' },
                    { value: 30, name: '四标段' },
                    { value: 28, name: '五标段' }
                ]
            }
        ]
    }
}