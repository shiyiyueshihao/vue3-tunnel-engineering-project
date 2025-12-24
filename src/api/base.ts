/**
 *  存放所有网络请求地址
 * 
*/

const base = {
    baseURL: "http://localhost:3000",                  //      公共地址
    login: "/api/login",                                         //       登录地址
    router: "/api/router",                                     //       用户权限
    line: '/api/line',                                               //       获取 line  图表数据
    pie:'/api/pie',                                                 //        获取 pie 图表数据
    projectInfo:"/api/project/all",                        //        获取 分页 信息  --  项目基础信息    
}

export default base