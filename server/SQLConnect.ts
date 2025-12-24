// import mysql from 'mysql'
// 原错误导入：import mysql from 'mysql'
import * as mysql from 'mysql'; // 改为命名空间导入

const MySQLObj = {
    host: "localhost",
    user: "root",
    password: "",
    //  对应的数据库  --  数据库的库名
    database: "vue_tunnelmanagementsystem"
}

const pool = mysql.createPool(MySQLObj)

//  router.ts  里面调用这个 SQLConnect 方法 然后我们会在这里返回从数据库里拿出的数据
function SQLConnect(sql, arr, callback) {
    //  链接数据库
    pool.getConnection((err, connection) => {
        if (err) {
            //  数据库连接失败  --  终止
            console.log(err);
            return;
        }

        connection.query(sql, arr, (err, result) => {
            //  释放连接  --  链接次数过多服务器会卡死
            connection.release()
            if (err) {
                console.log(err);
                return;
            }
            callback(result)
        })
    })
}
//  写完之后 我们就可以通过 postman  使用账号密码登录拿数据了  别忘了启动 server

export default SQLConnect