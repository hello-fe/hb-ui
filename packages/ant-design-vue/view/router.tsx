import {
  type RouteRecordRaw,
  createRouter,
  createWebHashHistory,
} from 'vue-router'
import {
  WindowsFilled,
  TableOutlined,
} from '@ant-design/icons-vue'
// import Form from './form'
import Table from './table'

export interface MetaRecord {
  title?: string
  icon?: JSX.Element
  show?: boolean
}

export const routes: RouteRecordRaw[] = [
  /* {
    path: '/form',
    name: 'form',
    component: Form,
    meta: {
      title: 'Form',
      icon: <WindowsFilled />,
    },
  }, */
  {
    path: '/table',
    name: 'table',
    component: Table,
    meta: {
      title: 'Table',
      icon: <TableOutlined />,
    },
  },
  {
    path: '/',
    redirect(to) {
      return routes[0].path
    },
    meta: {
      show: false,
    },
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
