# element-ui
基于 Element UI 二次封装的一些常用组件

## 组件

使用方法点击组件名称查看

<table>
  <thead>
    <th>名称</th>
    <th>描述</th>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://github.com/hello-fe/element-ui/tree/main/components/form">Form</a>
      </td>
      <td>
        基于 element-ui/form、配置化
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://github.com/hello-fe/element-ui/tree/main/components/table">Table</a>
      </td>
      <td>
        基于 element-ui/table、配置化、接管请求、接管分页
      </td>
    </tr>
  </tbody>
</table>

## 工程

第一感官像是一个普通的 Vite 应用，事实确实如此 -- 鲁迅

```tree
├─┬ components      组件源码目录
│ ├── form
│ └── table
│
├─┬ es              组件输出目录
│ ├── form
│ └── table
│
├── scripts         组件构建脚本
├── server          mock server
├── view            开发组件实时预览
└── vite.config.js
```

## 开发

即 Vite 应用相同的开发方式

```sh
npm run dev
```

## 构建

构建脚本会将 `components/*` 构建到 `es/*`

```sh
npm run build
```
