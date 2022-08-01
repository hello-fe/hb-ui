import Router from 'vue-router'

export default new Router({
  routes: [
    {
      path: '/table-vue',
      component: () => import('./table/basic-vue/index.vue'),
    },
    {
      path: '/table-tsx',
      component: () => import('./table/basic-tsx'),
    },
  ],
})
