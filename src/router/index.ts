import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView/HomeView.vue'
import Login from '@/views/Login/Login.vue'
import layout from '@/views/layout.vue'

import { useLoginStore } from '@/stores/loginStore'
import { useControlMenuStore } from '@/stores/ControlMenuStore'
import workManagementRoute from '@/router/dynamicRoute.ts'
import api from '@/api'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //  登录页页面
    {
      path: '/login',
      name: 'login',
      component: Login
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
  const loginStore = useLoginStore()
  const controlMenuStore = useControlMenuStore()

  // 登录拦截
  if (to.path !== '/login' && !loginStore.token) {
    return next('/login')
  }

  // 检查动态路由是否已加载 (以 404 路由是否存在为基准)
  const isRouterLoaded = router.hasRoute('notfound')

  if (loginStore.token && !isRouterLoaded) {
    try {
      // 如果 menus 是空的，直接在这里调一次 API
      if (controlMenuStore.menus.length === 0) {
        const res = await api.getRouter({ user: loginStore.permission })
        if (res.data.status === 200) {
          controlMenuStore.menus = res.data.menuData.menus
        }
      }

      // 根据最新的 menus 数据动态添加路由
      controlMenuStore.menus.forEach(item => {
        if (item.path === '/workManagement' && loginStore.permission === 'admin') {
          router.addRoute('layout', workManagementRoute)
        }
      })

      // 最后添加 404，确保它在最末尾
      router.addRoute(notFoundRoute)

      // 重定向，让路由重新匹配新加载的路由表
      return next({ ...to, replace: true })

    } catch (error) {
      console.error('动态路由加载失败', error)
      return next('/login')
    }
  }

  //  其他逻辑
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
})

export default router
