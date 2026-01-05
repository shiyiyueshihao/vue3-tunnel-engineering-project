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

//  文件上传
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'

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


// 验证 Token 的中间件
const verifyToken = (req, res, next) => {
    // 1. 从请求头拿到 Token
    // 这里的格式通常是 "Bearer <token>"，所以需要分割字符串
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ msg: "未提供Token，请登录" });
    }

    // 2. 开始验证
    jwt.verify(token, jwtSecret.secret, (err, user) => {
        if (err) {
            // 验证失败：Token伪造或者过期
            return res.status(403).send({ msg: "Token无效或已过期" });
        }

        // 3. 验证成功：把解出来的数据挂载到 req 对象上，方便后面的接口使用
        req.user = user;
        next(); // 通行，继续执行后面的路由逻辑
    });
};


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

router.get("/router", verifyToken, (req, res) => {
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
router.get("/project/all", verifyToken, (req, res) => {
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
router.get("/project/search", verifyToken, (req, res) => {
    //  接收参数：查询内容
    const search = url.parse(req.url, true).query.search;
    //  模糊查询sql语句编写  name code address remark  (数据库表头 number 修改为 code)
    const sql = "select * from project where concat(`name`,`code`,`address`,`remark`) like '%" + search + "%' ";
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

router.get("/project/total", verifyToken, (req, res) => {
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

/** 
 *      隧道项目基础信息 添加 功能
*/

router.get('/project/add', verifyToken, (req, res) => {
    //      添加   可以为空
    var name = url.parse(req.url, true).query.name || "";
    var code = url.parse(req.url, true).query.code || "";
    var money = url.parse(req.url, true).query.money || "";
    var address = url.parse(req.url, true).query.address || "";
    var duration = url.parse(req.url, true).query.duration || "";
    var startTime = url.parse(req.url, true).query.startTime || "";
    var endTime = url.parse(req.url, true).query.endTime || "";
    var tunnelNumber = url.parse(req.url, true).query.tunnelNumber || "";
    var status = url.parse(req.url, true).query.status || "";
    var remark = url.parse(req.url, true).query.remark || "";
    const sql = "insert into project values (null,?,?,?,?,?,?,?,?,?,?)";
    const arr = [name, code, money, address, duration, startTime, endTime, tunnelNumber, status, remark]
    SQLConnect(sql, arr, result => {
        if (result.affectedRows > 0) {
            res.send({
                status: 200,
                msg: "添加成功"
            })
        } else {
            res.send({
                status: 500,
                msg: "添加失败"
            })
        }
    })
})


/**
 *          隧道项目基础信息  删除 功能 
*/

router.get("/project/del", verifyToken, (req, res) => {
    var id = url.parse(req.url, true).query.id;
    var sql = "delete from project where id=?";
    SQLConnect(sql, [id], result => {
        if (result.affectedRows > 0) {
            res.send({
                status: 200,
                msg: "删除成功"
            })
        } else {
            res.send({
                status: 500,
                msg: "删除失败"
            })
        }
    })
})


/**
 *          隧道项目基础信息  编辑 功能    --   预更新
*/

router.get("/project/update/pre", verifyToken, (req, res) => {
    var id = url.parse(req.url, true).query.id;
    var sql = "select *  from project where id=?";
    SQLConnect(sql, [id], result => {
        if (result.length > 0) {
            res.send({
                status: 200,
                result: result[0]
            })
        } else {
            res.send({
                status: 500,
                msg: "预更新失败"
            })
        }
    })
})

/**
 *      隧道项目基础信息  编辑  功能  --  修改
 *          restFull  API
 *                  get 、post 、put 、del...
 * 
*/
// postman 测试
router.put("/project/update/:id", verifyToken, (req, res) => {
    const id = req.params.id;   //  接收 上面的 :id
    const { name, code, money, address, duration, startTime, endTime, tunnelNumber, status, remark } = req.body;
    //  sql 更新语句 需要对应上面的 数据  根据id 查找
    const sql = "update project set name=?,code=?,money=?,address=?,duration=?,startTime=?,endTime=?,tunnelNumber=?,status=?,remark=? where id=?";
    //  数组要对应上面的sql数据  11 条数据
    const arr = [name, code, money, address, duration, startTime, endTime, tunnelNumber, status, remark, id];
    SQLConnect(sql, arr, result => {
        if (result.affectedRows > 0) {
            res.send({
                status: 200,
                msg: "修改成功"
            })
        } else {
            res.send({
                status: 500,
                msg: "修改失败"
            })
        }
    })
})

/**
 *      隧道设计信息 tree 列表 一级
 * 
*/
router.get("/tunnel/list", verifyToken, (req, res) => {
    const sql = "select * from tunnel"
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
 *      隧道设计信息 tree 列表 二级
 * 
*/
router.get("/tunnel/list/child", verifyToken, (req, res) => {
    const cid = url.parse(req.url, true).query.cid
    if (!cid) {
        return res.send({
            status: 400,
            msg: "缺少必要参数 cid"
        })
    }
    const sql = "select * from tunnelchild where cid=?"
    SQLConnect(sql, [cid], result => {
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
 *      隧道设计信息 tree 列表 三级
 * 
*/
router.get("/tunnel/list/child/grandchild", verifyToken, (req, res) => {
    const gid = url.parse(req.url, true).query.gid
    if (!gid) {
        return res.send({
            status: 400,
            msg: "缺少必要参数 gid"
        })
    }
    const sql = "select * from tunnelgrandchild where gid=?"
    SQLConnect(sql, [gid], result => {
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
 *          tree树形控件 table  的 文件上传接口
*/

// 1. 配置存储
const storage = multer.diskStorage({
    // 修改 destination 为函数形式，更稳妥
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        // 检查文件夹是否存在，不存在则创建
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // 解决中文名乱码问题：强制转码
        file.originalname = Buffer.from(file.originalname, "latin1").toString(
            "utf8"
        );
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// 2. 增加限制配置
const upload = multer({
    storage: storage,
    // 限制文件大小
    limits: {
        fileSize: 10 * 1024 * 1024 // 限制为 10MB，单位是字节 (Byte)
    },
    // 限制文件类型（后缀名）
    fileFilter: (req, file, cb) => {
        // 允许的文件后缀名
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
        // 获取当前上传文件的后缀名
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(ext)) {
            cb(null, true); // 允许上传
        } else {
            // 拒绝上传并抛出错误
            cb(new Error('仅支持上传 JPG/PNG/PDF 格式的文件！') as any, false);
        }
    }
});

/**
 *       3. 接口逻辑（保持不变，但增加错误处理）     
 *              3.1.  按照数据库 id  和 file_url 存储 上传的文件  存到  uploads里去 
 *              3.2   按照 前端返回的信息   1.cid   2.gid  来确定子孙级别
 */

router.post('/upload', verifyToken, (req: Request, res: Response) => {
    upload.single('file')(req, res, (err: any) => {
        // 1. 错误捕获 (保持你之前的优秀逻辑)
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE' ? '文件超过10MB' : err.message;
            return res.send({ status: 500, msg });
        }

        // 2. 获取参数
        const file = req.file;
        const { id, type } = req.body; // type 用来判断是哪张表：'child' 或 'grand'

        if (!file || !id || !type) {
            return res.send({ status: 500, msg: '参数不完整：缺少文件、ID或分类类型' });
        }

        // 3. 动态确定目标表名
        // 这样以后如果你有表四 (tunnelgreatgrandchild)，只需在这里加一行
        let tableName = '';
        if (type === 'child') {
            tableName = 'tunnelchild';
        } else if (type === 'grand') {
            tableName = 'tunnelgrandchild';
        } else {
            return res.send({ status: 500, msg: '错误的分类类型' });
        }

        const filePath = `/uploads/${file.filename}`;

        // 4. 执行精准更新
        // 使用模板字符串动态插入表名，使用 ? 绑定变量防止 SQL 注入
        const sql = `UPDATE ${tableName} SET file_url = ? WHERE id = ?`;

        SQLConnect(sql, [filePath, id], (result: any) => {
            if (result && result.affectedRows > 0) {
                res.send({
                    status: 200,
                    msg: `上传成功并关联至${tableName}`,
                    url: filePath,
                    data: { id, type }
                });
            } else {
                res.send({ status: 500, msg: '关联失败，请检查ID是否存在于该表中' });
            }
        });
    });
});


/**
 *          工作监督管理查询 总数
 */
// 接口：查询监督任务的总条数
router.get('/supervision/totalCount', verifyToken, (req, res) => {
    // 1. 定义 SQL 语句
    const sql = 'SELECT COUNT(*) as total FROM supervision_tasks';

    // 2. 执行 SQL
    SQLConnect(sql, (err, results) => {
        // 3. 处理错误
        if (err) {
            return res.send({
                status: 500,
                message: '查询失败',
                error: err.message
            });
        }

        // 4. 返回查询到的条数
        // results[0].total 对应 SQL 里的 as total
        res.send({
            status: 200,
            message: '获取成功数据条数成功',
            total: results[0].total
        });
    });
});


/**
 *      工作监督管理分页查询
 *          路由: /api/supervision/list?page=1
 */
router.get("/supervision/list", verifyToken, (req, res) => {
    // 1. 获取当前页码，默认为第 1 页
    const page = parseInt(url.parse(req.url, true).query.page as string) || 1;
    const pageSize = 8; // 设定每页 8 条
    const offset = (page - 1) * pageSize;

    // 2. 编写 SQL 语句
    // 根据图片中的表名 supervision_tasks，按 id 倒序排列
    const sql = "SELECT * FROM supervision_tasks ORDER BY id DESC LIMIT ? OFFSET ?";

    SQLConnect(sql, [pageSize, offset], result => {
        if (result && result.length > 0) {
            res.send({
                status: 200,
                result,
                pagination: {
                    currentPage: page,
                    pageSize: pageSize
                }
            });
        } else {
            res.send({
                status: 200, // 或者是 500 根据你的业务逻辑，通常空数据也返回200
                result: [],
                msg: "暂无更多数据"
            });
        }
    });
});



/**
 * 工作监督管理 ：组合筛选 + 全局模糊查询
 */

router.get("/supervision/search", verifyToken, (req, res) => {
    try {
        const query = url.parse(req.url, true).query;

        // 统一参数名：确保这里和前端传过来的 params 键名一致
        const st = query.st;
        const et = query.et;
        const location = query.location || "";
        const risk = query.risk || "";
        const search = query.search || "";

        // 基础 SQL
        let sql = "SELECT * FROM supervision_tasks WHERE 1=1";
        const params = [];

        // 情况 A：如果有日期范围，加入日期区间过滤
        if (st && et && st !== 'undefined' && et !== 'undefined') {
            const startStr = st.replace(/-/g, "");
            const endStr = et.replace(/-/g, "");
            sql += " AND (SUBSTRING_INDEX(SUBSTRING_INDEX(task_no, '-', 2), '-', -1) BETWEEN ? AND ?)";
            params.push(startStr, endStr);
        }

        // 情况 B：标段匹配
        if (location) {
            sql += " AND location LIKE ?";
            params.push(`%${location}%`);
        }

        // 情况 C：危险等级匹配
        if (risk) {
            sql += " AND status = ?";
            params.push(risk);
        }

        // 情况 D：全局模糊搜索 (你要求的必填项)
        if (search) {
            sql += " AND (task_no LIKE ? OR responsible_unit LIKE ? OR supervision_type LIKE ? OR location LIKE ? OR status LIKE ?)";
            const keyword = `%${search}%`;
            params.push(keyword, keyword, keyword, keyword, keyword);
        }

        sql += " ORDER BY task_no DESC";

        console.log("最终执行SQL:", sql, params);

        SQLConnect(sql, params, result => {
            res.send({
                status: 200,
                result: result || [],
                msg: (result && result.length > 0) ? "查询成功" : "未找到匹配数据"
            });
        });
    } catch (error) {
        console.error("服务器内部错误:", error);
        res.send({ status: 500, msg: "服务器内部错误" });
    }
});

/** * 动态获取所有标段（超级优化版：彻底去除变电站、路基位等后缀）
 */
router.get("/supervision/sections", verifyToken, (req, res) => {
    // 1. 先从数据库拿到原始的 location 列表并去重
    const sql = "SELECT DISTINCT location FROM supervision_tasks";
    
    SQLConnect(sql, [], result => {
        if (!result) return res.send({ status: 200, result: [] });

        // 2. 在内存中进行正则清洗
        const sectionSet = new Set();
        
        result.forEach(item => {
            const loc = item.location;
            if (loc) {
                // 正则解析：匹配开头的 字母+数字组合（例如 YK10, ZK9, G318, DK15）
                // ^[A-Za-z0-9]+ 表示匹配字符串开头的所有连续字母或数字
                const match = loc.match(/^[A-Za-z0-9]+/);
                if (match) {
                    sectionSet.add(match[0]);
                }
            }
        });

        // 3. 转换回数组并排序（可选）
        const finalSections = Array.from(sectionSet).sort();

        res.send({
            status: 200,
            result: finalSections, // 这里返回的就是纯净的 ['G318', 'YK10', 'ZK9'...]
            msg: "标段列表清洗成功"
        });
    })
});


/**
 *      工作监督管理 获取 所有 状态
*/

/**
 * 动态获取所有任务状态（彻底去括号版）
 */
router.get("/supervision/status", verifyToken, (req, res) => {
    // 逻辑：
    // 1. 先按中文 '（' 切分
    // 2. 再按英文 '(' 切分
    // 3. 最后 TRIM 去掉可能存在的空格
    const sql = `
        SELECT DISTINCT 
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(status, '（', 1), '(', 1)) AS clean_status 
        FROM supervision_tasks 
        WHERE status IS NOT NULL AND status != ''
    `;
    
    SQLConnect(sql, [], (result, err) => {
        if (err) {
            return res.status(500).send({ status: 500, msg: "数据库查询失败" });
        }

        const statusList = result ? result.map(item => item.clean_status) : [];
        
        res.send({
            status: 200,
            result: statusList, 
            msg: "获取数据库状态成功"
        });
    });
});
//  导出 router 让外部可以访问
// module.exports = router
export default router //      --   ts写法