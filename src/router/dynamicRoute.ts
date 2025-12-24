// import type { Component } from 'vue'
// import type { RouteRecordRaw } from 'vue-router'


// interface metaItem {
//     requireLogin: boolean,
//     key: string
// }

// interface workManagementDesign {
//     path: string,
//     name: string,
//     component: Component
//     meta: metaItem,
//     children?: RouteRecordRaw[]
// }

const workManagementRoute= {
    //  工作监督管理  动态路由 权限
    path: 'workManagement',
    name: 'workManagement',
    component: () => import('../views/WorkManagementView/WorkManagementView.vue'),
    meta: {
        requireLogin: true,
        key: "工作监督管理"
    },
}

export default workManagementRoute