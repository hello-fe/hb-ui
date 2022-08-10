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
            <el-menu default-active="3" class="el-menu-vertical-demo">
              {routes.map((route, index) => (
                  <router-link class='router-link' to={route.path}>
                    <el-menu-item index={String(index + 1)}>
                      <i class={route.meta?.icon || 'el-icon-menu'} />
                      {route.name}
                    </el-menu-item>
                  </router-link>
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
