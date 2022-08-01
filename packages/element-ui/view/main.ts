import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/zh-CN'
import router from './router'
import App from './App'

import 'element-ui/lib/theme-chalk/index.css'

Vue.use(VueRouter)
Vue.use(ElementUI, { locale, size: 'mini' })

new Vue({
  el: '#app',
  render: h => h(App),
  router,
})
