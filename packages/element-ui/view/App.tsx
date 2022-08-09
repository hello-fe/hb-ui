import { Component } from 'vue'
import { routes } from './router'

const App: Component = {
  data() {
    return {
      openedMenus: [],
    }
  },
  methods: {
    forward(path: string) {
      if (this.$route.path === path) return
      this.$router.push(path)
    }
  },
  render() {

    return (
      <el-container class="app-vue">
        <el-header>
          <a
            style={'cursor:pointer;' + (this.$route.path === '/' ? 'color:#409EFF;' : '')}
            on-click={() => this.forward('/')}
          >
            Hello/hb-ui
          </a>
        </el-header>

        <el-container>
          <el-aside width="200px">
            <el-menu default-active="1" class="el-menu-vertical-demo">
              {routes.map((route, index) => (
                <el-menu-item
                  index={String(index + 1)}
                  on-click={() => this.forward(route.path)}
                >
                  <i class={route.meta?.icon || 'el-icon-menu'}></i>
                  {/* <router-link class="router-link" slot="title" to={route.path}>{route.name}</router-link> */}
                  <a>{route.name}</a>
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
