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
8.  typescript  --  自带
9.  sass
10. 富文本编辑器  TinyMCE
        npm install tinymce@6.2.0 @tinymce/tinymce-vue@5.0.0


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

7.  网络请求
    7.1 封装
      7.1.1   --    状态码  /  请求拦截   /   响应拦截   


  