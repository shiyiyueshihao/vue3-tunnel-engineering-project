// const express = require("express")
import express from 'express' //      --   ts写法   
const app = express();
//  解决跨域引入依赖
import cors from 'cors'

//  post 请求 额外操作  -- 安装依赖   body-parser
import bodyParser from 'body-parser'

// ✅ 正确写法：
app.use(cors({
    origin: 'http://localhost:5173', // 👈 这里填你前端 Vue 运行的具体地址
    credentials: true,               // 👈 必须设为 true，允许跨域传 Cookie
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//  配置 post 请求
app.use(bodyParser.urlencoded({
    extended: true
}))

//  导入 路由  --  配置post 需要再 他之前完成
// const router = require("./router.js")
import router from './router.ts'
//  使用
app.use('/api', router)

//  静态资源访问：为了让前端能看到上传后的图片，后端需要配置静态资源托管
app.use('/uploads', express.static('uploads'));

// 尝试从环境变量读取端口，读取不到则默认使用 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`--------------------------------------`);
    console.log(`🚀 服务器启动成功!`);
    console.log(`📡 运行地址: http://localhost:${PORT}`);
    console.log(`--------------------------------------`);
});