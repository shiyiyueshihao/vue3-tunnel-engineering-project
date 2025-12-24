export default {
    menus: [
        {
            path: "/",
            name: "首页",
            icon: "House"
        },
        {
            path: "/projectInfo",
            name: "项目基础信息",
            icon: "Connection"
        },
        {
            path: "/tunnelDesign",
            name: "隧道设计信息",
            icon: "MessageBox"
        },
        {
            path: "/constructionInspection",
            name: "施工监控监测",
            icon: "Discount",
            children: [
                {
                    path: "/plan",
                    name: "检测计划"
                }, {
                    path: "/section",
                    name: "切面检测"
                }
            ]
        },
        {
            path: "/geologicalForecast",
            name: "超前地质预报",
            icon: "Pointer"
        },
        {
            path: "/systemInfo",
            name: "系统信息管理",
            icon: "Setting"
        },
    ]
}