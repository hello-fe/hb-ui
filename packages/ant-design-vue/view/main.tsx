import { createApp } from 'vue'
import router from './router'
import App from './App'

import 'ant-design-vue/dist/antd.css'

createApp(App)
  .use(router)
  .mount('#app')
