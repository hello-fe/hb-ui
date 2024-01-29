import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App'

import 'antd/dist/antd.css'
import './global.less'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider prefixCls='hb'>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
)
