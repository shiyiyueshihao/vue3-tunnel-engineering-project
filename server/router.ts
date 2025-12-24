// const express = require("express")
import express from 'express' //      --   ts写法
const router = express.Router()     //  --  R要大写
//  引入 SQLConncet 
import SQLConnect from './SQLConnect.ts'
//  get方法
import url from 'url'
//  引入 token  --  需要一个密钥 ，所以还得创建一个文件夹
import jwt from 'jsonwebtoken'
import jwtSecret from './jwtSecret.ts' //  引入密钥
import adminData from './data/admin.ts'
import vipData from './data/vip.ts'
import lineData from './data/line.ts'
import pieData from './data/pie.ts'

// 添加接口  --  测试
// router.get('/list', (req, res) => {
//     res.send({
//         status: 200,
//         message: "测试服务器"
//     })
// })
/*
 *  登录接口   --  index.ts 写了个 /api 主入口 ，所以这里需要  /api+/login
 * */
router.post('/login', (req, res) => {
    //  接收客户端的参数：username password
    const { username, password } = req.body;
    // console.log(username,password); //  打印 账号密码 查看后端有没有测试问题
    //  执行sql语句 (查询)
    const sql = "select * from user where username=? and password=?";
    SQLConnect(sql, [username, password], result => {
        if (result.length > 0) {
            /**
             *  生成 token 
             *  token：前后端在登录信息交互的时候，通过token验证是否登录成功的字段
            */
            const token = jwt.sign({
                id: result[0].id,
                username: result[0].username,
                permission: result[0].permission
            }, jwtSecret.secret)
            //  返回给前端的数据
            res.send({
                status: 200,
                // result
                username: result[0].username,
                permission: result[0].permission,
                token
            })
        } else {
            res.send({
                status: 500,
                msg: "用户名密码错误"
            })
        }
    })
})


/**
 *  用户权限 管理
*/

router.get("/router", (req, res) => {
    const user = url.parse(req.url, true).query.user;
    switch (user) {
        case "admin":
            res.send({
                status: 200,
                menuData: adminData
            })
            break;
        case "vip":
            res.send({
                status: 200,
                menuData: vipData
            })
            break;

        default:
            res.send({
                status: 200,
                menuData: vipData
            })
            break;
    }
})

/***
 *  echarts 图表 line图表
*/

router.get("/line", (req, res) => {
    res.send({
        status: 200,
        result: lineData
    })
})

/***
 *  echarts 图表 line图表
*/

router.get("/pie", (req, res) => {
    res.send({
        status: 200,
        result: pieData
    })
})


/**
 *    隧道信息查询
*/
router.get("/project/all", (req, res) => {
    //  分页查询
    //     || 1 --> 保底机制  当用户不输入  list?page=1 的时候，页面就是第一页数据
    var page = url.parse(req.url, true).query.page || 1;
    //  sql 查询语句    --   查询  project 数据库 倒序 并且每次都是查询15个数据  偏移量 为 (page - 1) * 15
    const sql = "select * from project order by id desc limit 15 offset " + (page - 1) * 15;
    SQLConnect(sql, null, result => {
        if (result.length > 0) {
            res.send({
                status: 200,
                result
            })
        } else {
            res.send({
                status: 500,
                msg: "暂无信息"
            })
        }
    })
})


/**
 *      隧道模糊查询
 */
router.get("/project/search", (req, res) => {
    //  接收参数：查询内容
    const search = url.parse(req.url, true).query.search;
    //  模糊查询sql语句编写  name number address remark
    const sql = "select * from project where concat(`name`,`number`,`address`,`remark`) like '%" + search + "%' ";
    SQLConnect(sql, null, result => {
        if (result.length > 0) {
            res.send({
                status: 200,
                result
            })
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            })
        }
    })
})

/**
 *      获得总条数据
 */

router.get("/project/total", (req, res) => {
    const sql = "select count(*) from project where id";
    SQLConnect(sql, null, result => {
        if (result.length > 0) {
            res.send({
                status: 200,
                result
            })
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            })
        }
    })
})

//  导出 router 让外部可以访问
// module.exports = router
export default router //      --   ts写法