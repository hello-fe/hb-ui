import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
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

  return (
    <Layout>
      <Header
        className="site-layout-background"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <h2 onClick={() => { navigate('/') }} style={{ margin: 0, color: 'white' }}>@hb-ui/antd</h2>
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
            defaultSelectedKeys={['1']}
            items={[
              {
                key: '1',
                icon: <UserOutlined />,
                label: 'Form',
                onClick() {
                  navigate('/form')
                },
              },
              {
                key: '2',
                icon: <VideoCameraOutlined />,
                label: 'Table',
                onClick() {
                  navigate('/table')
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
            minHeight: 'calc(100vh - 110px)',
          }}
        >
          <h2>Hey here! 👋</h2>
          <hr />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
