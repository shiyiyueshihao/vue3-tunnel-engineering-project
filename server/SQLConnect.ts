// import mysql from 'mysql'
// 原错误导入：import mysql from 'mysql'
import * as mysql from 'mysql'; // 改为命名空间导入

const MySQLObj = {
    host: "localhost",
    user: "root",
    password: "",
    database: "vue_tunnelmanagementsystem",
    connectionLimit: 50, // 显著提高并发处理能力
    queueLimit: 0,       // 允许排队
    waitForConnections: true
}

const pool = mysql.createPool(MySQLObj)

//  router.ts  里面调用这个 SQLConnect 方法 然后我们会在这里返回从数据库里拿出的数据
function SQLConnect(sql, arr, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("【数据库连接池获取失败】:", err);
            // 如果获取连接失败，也要通知前端，不要让请求一直挂着
            return callback(null, err); 
        }

        connection.query(sql, arr, (err, result) => {
            // 确保释放连接
            connection.release();

            if (err) {
                console.error("【SQL执行失败】:", err);
                // 传回错误信息，让接口能返回 500 而不是一直 Pending
                return callback(null, err); 
            }
            // 成功则返回结果，第二个参数传 null 表示无错误
            callback(result, null);
        });
    });
}
//  写完之后 我们就可以通过 postman  使用账号密码登录拿数据了  别忘了启动 server

export default SQLConnect