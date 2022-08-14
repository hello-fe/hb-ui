import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Divider, Layout, Menu } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout style={{ height: '100%' }}>
      <Header
        className="site-layout-background"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <h2
          onClick={() => { navigate('/') }}
          style={{ margin: 0, color: location.pathname === '/' ? '#1890ff' : 'white', cursor: 'pointer' }}
        >
          @hb-ui/antd
        </h2>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: 'trigger',
          style: { marginLeft: 15, },
          onClick: () => setCollapsed(!collapsed),
        })}
      </Header>
      <Layout className="site-layout">
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={[
              {
                key: '/form',
                icon: <UserOutlined />,
                label: 'Form',
                onClick() {
                  navigate('/form')
                },
              },
              {
                key: '/table',
                icon: <VideoCameraOutlined />,
                label: 'Table',
                onClick() {
                  navigate('/table')
                },
              },
              {
                key: '/table-edit',
                icon: <VideoCameraOutlined />,
                label: 'Table-edit',
                onClick() {
                  navigate('/table-edit')
                },
              },
            ]}
          />
        </Sider>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            backgroundColor: 'white',
          }}
        >
          <h2>Hey here! 👋</h2>
          <Divider />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
