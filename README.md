## 项目所需要的技术栈

1.  基本框架：Vue3  --  自带
2.  网络请求：axios   --  npm install axios --save
3.  路由：Vue-Router  --  自带
4.  状态管理：pinia  --  自带
    4.1 仓库持久化  --  pinia 插件  pinia-plugin-persistedstate  --  兼容3版本pinia 而且更加灵活
        npm install pinia-plugin-persistedstate --save
        main.ts 引入和使用插件 
5.  图标：echarts  --  npm install --save echarts
6.  语言切换：vue-i18n  --  npm install --save vue-i18n@next  (最新版)
7.  UI组件库：element-plus  --  npm install --save element-puls
  7.1 按需加载组件安装(别忘了配置vite.config.ts)  --  npm install -D unplugin-vue-components unplugin-auto-import
  7.2 icons  --  npm install @element-plus/icons-vue  --  独立的包 再哪里使用 哪里引入 不用全局

8.  网络请求
    8.1 封装
      8.1.1   --    状态码  /  请求拦截   /   响应拦截   
9.  typescript  --  自带
10.  sass
11. 富文本编辑器  TinyMCE
        npm install tinymce@6.2.0 @tinymce/tinymce-vue@5.0.0
12. 文件上传
        需要安装 multer 库来解析文件数据 
            npm install multer


##  编辑功能，数据回显
### 1.使用人数较少的时候
            拿到当前表格中的数据  row  ，重新赋值到编辑对话框中
### 2.使用人数较多的时候
            通过网络请求获取新的对应此条数据(预更新)  A改了 B请求就会发现数据被改而不是 A改了 B还本地查不到再改一遍

                编辑思路
                    1. 通过网络请求获取最新数据(预更新)
                    2. 通过 唯一 ID 传递给 子组件(富文本)  实现网络请求预更新
                    3. 富文本需要在本次网络请求之前做一次额外的网络请求先拿到最新的 通过ID 对应的 remark  然后 remark 就可以
                            赋值给 v-model textContent 进行传值给编辑对话框   这样就相当于 用 网络请求拿到了 所有数据
                    4. 对话框是不会自我销毁的，我们第二次那数据他就不会更新  所以 得 关闭的时候销毁对话框而不是保存关闭
                            el-dialog 里有个  destroy-on-close  就是 关闭时销毁对话框 即可达成


## 后台服务器模拟搭建

1.  创建一个独立的 server 文件夹 里面引入 express 
        npm install express --save
2.  写 index.ts 基础文件 和 router.ts  路由文件
3.  post 请求需要额外安装依赖  --  server 文件下的终端安装依赖
        npm isntall --save body-parser


## 后端
4.  跨域的解决方案
    4.1   前端
        4.1.1   JSONP
        4.1.2   Proxy(开发环境生效)
    4.2   后端
        4.2.1 cors 解决跨域
            npm install --save cors

5.  数据库 SQL  链接数据库
      5.1   安装依赖    --     npm install  --save mysql
      5.2   创建 专门用来链接数据库的ts文件
6.  token  --  前端拿 token 做登录验证
      6.1 为了安全，后端返回前端的数据是 以token 形式的  
          6.1.1 安装依赖  --  npm install --save jsonwebtoken
          6.1.2 jsonwebtoken 还需要一个密钥，所以我们还得创建一个额外的文件夹




  