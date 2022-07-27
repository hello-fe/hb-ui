import Vue from 'vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/zh-CN'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'

Vue.use(ElementUI, { locale, size: 'mini' })

new Vue({
  el: '#app',
  render: h => h(App),
})
