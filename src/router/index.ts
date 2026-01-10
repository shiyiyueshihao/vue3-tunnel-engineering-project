import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView/HomeView.vue'
import Login from '@/views/Login/Login.vue'
import layout from '@/views/layout.vue'

import { useLoginStore } from '@/stores/loginStore'
import { useControlMenuStore } from '@/stores/ControlMenuStore'
import workManagementRoute from '@/router/dynamicRoute.ts'
import api from '@/api'

/**
 *      路由跳转进度条
 *          1.  安装 npm install --save nprogress  --save-dev @types/nprogress
 *          2.  引入 nprogress 和 样式
 *          3.  配置配置项(可选)
 *          4.  路由全局前置导航守卫：开始进度条 
 *          5.  路由全局后置导航守卫：结束进度条
 *          6.  颜色配置 在App.vue 中写
 */
// 引入 nprogress
import nprogress from 'nprogress'
// 引入 nprogress 样式（必须引入，否则进度条不可见）
import 'nprogress/nprogress.css'
// 配置nprogress配置项（可选）
nprogress.configure({
  easing: 'ease',      // 动画方式 
  speed: 500,          // 递增进度条的速度 
  showSpinner: false,  // 是否显示右上角螺旋加载图标
  trickleSpeed: 200,   // 自动递增间隔
  minimum: 0.3         // 初始化时的最小百分比
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //  登录页页面
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    //  注册页面
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register/register.vue'),
      meta: {
        key: "注册"
      }
    },
    //  文件预览页面
    {
      path: '/filePrewview',
      name: 'filePrewview',
      component: () => import('../views/FilePreviewView/FilePreviewView.vue'),
      meta: {
        requireLogin: true,
        key: "文件预览"
      }
    },
    {
      path: '/',
      name: 'layout',
      component: layout,
      meta: { requireLogin: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: {
            requireLogin: true,
            key: "首页"
          },
        },
        {
          path: 'projectInfo',
          name: 'projectInfo',
          component: () => import('../views/ProjectInfoView/ProjectInfoView.vue'),
          meta: {
            requireLogin: true,
            key: "项目基础信息"
          },
        },
        {
          path: 'tunnelDesign',
          name: 'tunnelDesign',
          component: () => import('../views/TunnelDesignView/TunnelDesignView.vue'),
          meta: {
            requireLogin: true,
            key: "隧道设计信息"
          }
        },
        //  工作监督管理  动态路由 权限  --  独立写一个文件 加载路由页面
        {
          path: 'constructionInspection',
          name: 'constructionInspection',
          component: () => import('../views/ConstructionInspectionView/ConstructionInspectionView.vue'),
          meta: {
            requireLogin: true,
            key: "施工监控监测"
          },
          children: [
            {
              path: "plan",
              name: "plan",
              component: () => import('../views/ConstructionInspectionView/PlanTestView/PlanTestView.vue'),
              meta: {
                requireLogin: true,
                key: "检测计划"
              }
            },
            {
              path: "section",
              name: "section",
              component: () => import('../views/ConstructionInspectionView/SectionTestView/SectionTestView.vue'),
              meta: {
                requireLogin: true,
                key: "切面检测"
              }
            },
          ]
        },
        {
          path: 'geologicalForecast',
          name: 'geologicalForecast',
          component: () => import('../views/GeologicalForecastView/GeologicalForecastView.vue'),
          meta: {
            requireLogin: true,
            key: "超前地质预报"
          },
        },
        {
          path: 'systemInfo',
          name: 'systemInfo',
          component: () => import('../views/SystemInfoView/SystemInfoView.vue'),
          meta: {
            requireLogin: true,
            key: "系统信息管理"
          },
        },
        {
          path: 'personalcenter',
          name: 'personalcenter',
          component: () => import('../views/PersonalCenterView/PersonalCenterView.vue'),
          meta: {
            requireLogin: true,
            key: "个人中心"
          },
        }
      ]
    },
  ],
})


// 定义404页面路由 404 路径匹配规则   没有找到对应的路径地址
const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'notfound',
  component: () => import('../components/NotFound/NotFound.vue'),
}


// 路由守卫
router.beforeEach(async (to, from, next) => {
  nprogress.start()
  const loginStore = useLoginStore()
  const controlMenuStore = useControlMenuStore()

  // 定义白名单：不需要登录也能访问的路径
  const whiteList = ['/login', '/register']

  // 1. 修改后的判断：既没票，又要去的页面不在白名单里，才去登录
  if (!whiteList.includes(to.path) && !loginStore.token) {
    nprogress.done()
    return next('/login')
  }

  // 如果用户已经登录（有 Token），却还想去登录或注册页，建议直接跳转到首页
  if (whiteList.includes(to.path) && loginStore.token) {
    nprogress.done()
    return next('/') // 或者跳转到你的主页 layout
  }
  const isRouterLoaded = router.hasRoute('notfound')

  // 2. 有票但没加载动态路由（通常是刷新页面或首次进入）
  if (loginStore.token && !isRouterLoaded) {
    try {
      // 获取菜单数据
      const res = await api.getRouter() // 👈 确保这里不传参，靠 Token 识别

      // 如果后端因为 tick 不一致返回了 401/403，
      // Axios 拦截器会处理跳转，但这里最好也加一层保护
      if (res.data.status !== 200) {
        throw new Error('身份验证失败')
      }

      controlMenuStore.menus = res.data.menuData.menus

      // 动态添加路由
      controlMenuStore.menus.forEach(item => {
        if (item.path === '/workManagement' && loginStore.permission === 'admin') {
          router.addRoute('layout', workManagementRoute)
        }
      })
      // 最后添加 404，确保它在最末尾
      router.addRoute(notFoundRoute)
      nprogress.done()
      // 重定向，让路由重新匹配新加载的路由表
      return next({ ...to, replace: true })

    } catch (error) {
      console.error('动态路由加载失败:', error)
      nprogress.done()
      // 如果加载失败，说明 Token 可能由于 tick 原因废了，清空并去登录
      loginStore.token = ''
      return next('/login')
    }
  }

  next()
})

router.afterEach((to, from) => {
  //  1.  存 路由地址  --   保存跳转路径(存活) 
  //  2.  存 mtea 的 key  --  面包屑
  //  存储 路由路径 页面刷新仍保持状态
  const ControlMenuStore = useControlMenuStore()
  if (to.path) {
    ControlMenuStore.routerPath = to.path as string
  }
  if (to.meta.key) {
    ControlMenuStore.breadcrumb = to.meta.key as string
  }
  //  进度条结束
  nprogress.done()
})

export default router
