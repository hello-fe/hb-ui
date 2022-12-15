import { defineComponent, h, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Divider, Layout, Menu } from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons-vue'

const { Header, Sider, Content } = Layout

export default defineComponent({
  setup(props, ctx) {
    const collapsed = ref(false)
    const router = useRouter()
    const route = useRoute()

    return () => (
      <Layout style={{ height: '100%' }}>
        <Header
          class='site-layout-background'
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <h2
            onClick={() => { router.push('/') }}
            style={{ margin: 0, color: route.path === '/' ? '#1890ff' : 'white', cursor: 'pointer' }}
          >
            @hb-ui/antd
          </h2>
          {h(collapsed.value ? MenuUnfoldOutlined : MenuFoldOutlined, {
            class: 'trigger',
            style: 'margin-left:15px;',
            onClick: () => collapsed.value = !collapsed.value,
          })}
        </Header>
        <Layout class="site-layout">
          <Sider trigger={null} collapsed={collapsed.value}>
            <div class="logo" />
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[route.path]}
            >
              {[
                {
                  key: '/form',
                  icon: <UserOutlined />,
                  label: 'Form',
                  onClick() {
                    router.push('/form')
                  },
                },
                {
                  key: '/table',
                  icon: <VideoCameraOutlined />,
                  label: 'Table',
                  onClick() {
                    router.push('/table')
                  },
                },
                {
                  key: '/table-edit',
                  icon: <VideoCameraOutlined />,
                  label: 'Table-edit',
                  onClick() {
                    router.push('/table-edit')
                  },
                },
              ].map(item => <Menu.Item {...item}>{item.label}</Menu.Item>)}
            </Menu>
          </Sider>
          <Content
            class="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              backgroundColor: 'white',
            }}
          >
            <h2>Hey here! 👋</h2>
            <Divider />
            {ctx.slots.default?.()}
          </Content>
        </Layout>
      </Layout>
    )
  }
})
