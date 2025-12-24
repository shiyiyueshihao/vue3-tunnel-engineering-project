// const express = require("express")
import express from 'express' //      --   ts写法   
const app = express();
//  解决跨域引入依赖
import cors from 'cors'

//  post 请求 额外操作  -- 安装依赖   body-parser
import bodyParser from 'body-parser'
//  解决跨域
app.use(cors())
//  配置 post 请求
app.use(bodyParser.urlencoded({
    extended: true
}))

//  导入 路由  --  配置post 需要再 他之前完成
// const router = require("./router.js")
import router from './router.ts'
//  使用
app.use('/api', router)

app.listen(3000, () => {
    console.log("服务器运行在3000端口上");
})