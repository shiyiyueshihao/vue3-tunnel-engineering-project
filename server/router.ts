import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import SQLConnect from './SQLConnect.ts'
import url from 'url'

import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'; // 用于比对加密后的密码
import { v4 as uuidv4 } from 'uuid'; // 引入 UUID

import adminData from './data/admin.ts'
import vipData from './data/vip.ts'
import lineData from './data/line.ts'
import pieData from './data/pie.ts'

//  文件上传
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'

// 加载环境变量
dotenv.config();

const router = express.Router()

// 定义扩展的 Request 类型，方便 TS 识别 req.user
interface AuthRequest extends Request {
    user?: any;
}


/**
 *      临时的“脚本”生成哈希值
 */
// async function generateHash() {
//     const password = '555555'; // 你想设置的明文密码
//     const saltRounds = 10;     // 加密强度，通常选 10
    
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
    
//     console.log('--- 你的加密密码如下 ---');
//     console.log(hashedPassword); 
//     console.log('-----------------------');
// }
// generateHash();



/**
 * 1. 验证 Access Token 的中间件
 */
const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send({ status: 401, msg: "未提供Token" });

    jwt.verify(token, process.env.JWT_ACCESS_SECRET as string, (err, decoded: any) => {
        if (err) return res.status(403).send({ status: 403, msg: "Token已失效" });

        // --- 【新增：校验 tick】 ---
        SQLConnect("SELECT last_login_tick FROM user WHERE id = ?", [decoded.id], (result) => {
            if (result.length > 0 && result[0].last_login_tick === decoded.tick) {
                req.user = decoded;
                next();
            } else {
                // 如果数据库里的 tick 和 Token 里的不一致，说明别处登录了
                return res.status(401).send({ status: 401, msg: "您的账号已在别处登录，请重新登录" });
            }
        });
    });
};
/**
 * 5. 注册接口 (新用户默认权限为 normal)
 */
router.post('/register', async (req: Request, res: Response) => {
    const { username, password, phone } = req.body; // 👈 故意不解构 permission

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // 👈 SQL 语句直接写死 'vip'，不使用外部传参
        const sql = "INSERT INTO user (username, password, permission, phone) VALUES (?, ?, 'normal', ?)";
        
        SQLConnect(sql, [username, hashedPassword, phone], (result, err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).send({ status: 400, msg: "用户名已存在" });
                return res.status(500).send({ status: 500, msg: "注册失败" });
            }
            res.send({ status: 200, msg: "注册成功，欢迎加入！" });
        });
    } catch (error) {
        res.status(500).send({ status: 500, msg: "服务器错误" });
    }
});

/**
 * 6. 管理员修改用户权限 (需要管理员身份)
 */
router.post('/update-permission', verifyToken, (req: AuthRequest, res: Response) => {
    // 1. 检查当前操作者是否有 admin 权限
    if (req.user.permission !== 'admin') {
        return res.status(403).send({ status: 403, msg: "只有管理员能修改权限！" });
    }

    const { targetUserId, newPermission } = req.body;

    const sql = "UPDATE user SET permission = ? WHERE id = ?";
    SQLConnect(sql, [newPermission, targetUserId], (result, err) => {
        if (err) return res.status(500).send({ status: 500, msg: "修改失败" });
        res.send({ status: 200, msg: "权限修改成功" });
    });
});

/**
 * 2. 登录接口：双 Token 签发 + Bcrypt 验证
 */
router.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM user WHERE username=?";

    SQLConnect(sql, [username], async (result, err) => {
        if (err) return res.status(500).send({ status: 500, msg: "数据库错误" });

        if (result.length > 0) {
            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // --- 【核心修改点 1：生成 UUID】 ---
                const loginTick = uuidv4(); 

                // --- 【核心修改点 2：存入数据库】 ---
                const updateSql = "UPDATE user SET last_login_tick = ? WHERE id = ?";
                SQLConnect(updateSql, [loginTick, user.id], () => {
                    
                    // --- 【核心修改点 3：将 tick 放入 Access Token Payload】 ---
                    const accessToken = jwt.sign(
                        { 
                            id: user.id, 
                            username: user.username, 
                            permission: user.permission,
                            tick: loginTick // 以后校验就靠它
                        },
                        process.env.JWT_ACCESS_SECRET as string,
                        { expiresIn: '15m' }
                    );

                    // Refresh Token 保持不变 (或者也可以根据需求加入 tick)
                    const refreshToken = jwt.sign(
                        { id: user.id },
                        process.env.JWT_REFRESH_SECRET as string,
                        { expiresIn: '7d' }
                    );

                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: false, 
                        maxAge: 7 * 24 * 60 * 60 * 1000 
                    });

                    res.send({
                        status: 200,
                        username: user.username,
                        permission: user.permission,
                        token: accessToken 
                    });
                });
            } else {
                res.send({ status: 500, msg: "用户名或密码错误" });
            }
        } else {
            res.send({ status: 500, msg: "用户不存在" });
        }
    });
});
/**
 * 3. 刷新 Token 接口 (核心)
 */
router.post('/refresh', (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).send({ msg: "请重新登录" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: any, decoded: any) => {
        if (err) return res.status(403).send({ msg: "登录已失效" });

        // 必须通过 decoded.id 重新查询用户信息，以获取最新的 permission 和 username
        const sql = "SELECT * FROM user WHERE id=?";
        SQLConnect(sql, [decoded.id], (result, err) => {
            if (err || result.length === 0) return res.status(403).send({ msg: "用户不存在" });

            const user = result[0];
            const newAccessToken = jwt.sign(
                { id: user.id, username: user.username, permission: user.permission },
                process.env.JWT_ACCESS_SECRET as string,
                { expiresIn: '15m' }
            );

            res.send({ status: 200, token: newAccessToken });
        });
    });
});

/**
 * 4. 权限接口获取
 * 不再依赖前端传 user 参数，而是直接从 verifyToken 解出的 payload 里拿
 */
router.get("/router", verifyToken, (req: AuthRequest, res: Response) => {
    // 这里的 req.user 是在 verifyToken 中解出来的
    const permission = req.user.permission;

    // 根据权限返回对应菜单数据
    if (permission === 'admin') {
        res.send({ status: 200, menuData: adminData });
    } else {
        res.send({ status: 200, menuData: vipData });
    }
});


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
 * 工作监督管理 ：组合筛选 + 全局模糊查询 + 分页
 */

router.get("/supervision/search", verifyToken, (req, res) => {
    try {
        const query = url.parse(req.url, true).query;
        // 1. 获取参数并过滤非法字符串
        let { st, et, location, risk, search, page = 1 } = query;
        const size = 8;
        const offset = (parseInt(page) - 1) * size;

        // 定义一个严谨的判断函数
        const isLegal = (val) => val && val !== '' && val !== 'null' && val !== 'undefined';

        let whereSql = " WHERE 1=1";
        const params = [];

        // 2. 只有真正有值时才拼接 SQL
        if (isLegal(search)) {
            whereSql += " AND (task_no LIKE ? OR responsible_unit LIKE ? OR supervision_type LIKE ? OR location LIKE ? OR status LIKE ?)";
            const kw = `%${search}%`;
            params.push(kw, kw, kw, kw, kw);
        }

        if (isLegal(st) && isLegal(et)) {
            const startStr = st.replace(/-/g, "");
            const endStr = et.replace(/-/g, "");
            whereSql += " AND (SUBSTRING_INDEX(SUBSTRING_INDEX(task_no, '-', 2), '-', -1) BETWEEN ? AND ?)";
            params.push(startStr, endStr);
        }

        if (isLegal(location)) {
            whereSql += " AND location LIKE ?";
            params.push(`${location}%`);
        }

        whereSql += " AND status LIKE ?";
        params.push(`%${risk}%`);

        // 3. 执行分页查询逻辑
        const countSql = "SELECT COUNT(*) as total FROM supervision_tasks" + whereSql;
        SQLConnect(countSql, params, countRes => {
            const total = countRes[0]?.total || 0;
            const dataSql = `SELECT * FROM supervision_tasks ${whereSql} ORDER BY task_no DESC LIMIT ? OFFSET ?`;

            console.log("执行分页SQL:", dataSql, "参数:", [...params, size, offset]);

            SQLConnect(dataSql, [...params, size, offset], result => {
                res.send({ status: 200, result, total, msg: "查询成功" });
            });
        });
    } catch (error) {
        res.send({ status: 500, msg: "服务器错误" });
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
            const loc = item.location ? item.location.trim() : ""; // 先去前后空格
            if (loc) {
                // 核心修改：只匹配开头的连续字母
                // ^ 表示开头，[A-Za-z]+ 表示一个或多个连续的英文字母
                const match = loc.match(/^[A-Za-z]+/);

                if (match) {
                    // 此时提取出来的就是纯净的 AQ, DK, TBM, ZK
                    let cleanLoc = match[0]; // 建议转大写，防止数据库存的是小写导致重复
                    sectionSet.add(cleanLoc);
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