import { Component } from 'vue'
import { routes } from './router'

const App: Component = {
  data() {
    return {
      openedMenus: [],
    }
  },
  render() {
    return (
      <el-container class="app-vue">
        <el-header>
          Hello/hb-ui
        </el-header>

        <el-container>
          <el-aside width="200px">
            <el-menu default-active="1" class="el-menu-vertical-demo">
              {routes.map((route, index) => (
                <el-menu-item index={String(index + 1)}>
                  <i class={route.meta?.icon || 'el-icon-menu'}></i>
                  <router-link class="router-link" slot="title" to={route.path}>{route.name}</router-link>
                </el-menu-item>
              ))}
            </el-menu>
          </el-aside>

          <el-main>
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    )
  },
}

export default App
