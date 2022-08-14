import Router, { RouteConfig } from 'vue-router'

export const routes: RouteConfig[] = [
  {
    path: '/form-vue',
    name: 'Form(.vue)',
    component: ()=> import('./form/basic-vue/index.vue'),
    meta: {
      icon: 'el-icon-menu'
    },
  },
  {
    path: '/form-tsx',
    name: 'Form(.tsx)',
    component: () => import('./form/basic-tsx'),
    meta: {
      icon: 'el-icon-menu',
    },
  },
  {
    path: '/table-vue',
    name: 'Table(.vue)',
    component: () => import('./table/basic-vue/index.vue'),
    meta: {
      icon: 'el-icon-menu',
    },
  },
  {
    path: '/table-tsx',
    name: 'Table(.tsx)',
    component: () => import('./table/basic-tsx'),
    meta: {
      icon: 'el-icon-menu',
    },
  },
  {
    path: '/table-edit',
    name: 'Table-edit(.tsx)',
    component: () => import('./table-edit/basic-tsx'),
    meta: {
      icon: 'el-icon-menu',
    },
  },
]

export default new Router({
  routes,
})
