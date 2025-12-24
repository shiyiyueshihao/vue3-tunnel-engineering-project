import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView/HomeView.vue'
import Login from '@/views/Login/Login.vue'
import layout from '@/views/layout.vue'

import { useLoginStore } from '@/stores/loginStore'
import { useControlMenuStore } from '@/stores/ControlMenuStore'
import workManagementRoute from '@/router/dynamicRoute.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
          },
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
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    //  404 路径匹配规则   没有找到对应的路径地址
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../components/NotFound/NotFound.vue'),
    }
  ],
})



//  路由前置守卫  -- beforeEach
router.beforeEach((to, from, next) => {
  //  登录验证
  if (to.meta.requireLogin) {
    //  如果有 token 也直接跳转 否则 去登录页面
    const loginStore = useLoginStore()

    if (!loginStore.token) {
      next({
        path: "/login"
      })
    } else {
      next()
    }
  } else {
    next()
  }
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
