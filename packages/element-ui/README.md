# @hb-ui/element-ui

基于 Element UI 二次封装的一些常用组件

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
│
├─┬ view            开发组件实时预览
│ ├── form          form 使用案例
│ └── table         table 使用案例
│
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

## 组件

- 🤖 推荐将项目 clone 到本地，然后执行 `npm run dev` 看实际效果
- 🚨 推荐使用 `tsx` or `jsx`
- 🐢 [在线运行 - StackBlitz](https://stackblitz.com/edit/hb-ui-element-ui)

#### Form

- 基于 element-ui/form
- 配置化
- 搜索缓存

```ts
// 你可以根据 TS 类型提示使用
import { Form, FormProps } from '@hb-ui/element-ui'

export default {
  render() {
    /**
     * 如果你用的是 .jsx
     * @type {import('@hb-ui/element-ui').FormProps}
     */
    const formProps: FormProps = {
      // Form config
    }
  
    return <Form {...{ props: formProps }} />
  },
}
```

#### Table

- 基于 element-ui/table
- 配置化
- 可编辑
- 接管请求
- 接管分页

```ts
// 你可以根据 TS 类型提示使用
import { Table, TableProps } from '@hb-ui/element-ui'

export default {
  render() {
    /**
     * 如果你用的是 .jsx
     * @type {import('@hb-ui/element-ui').TableProps}
     */
    const tableProps: TableProps = {
      // Table config
    }
  
    return <Table {...{ props: tableProps }} />
  },
}
```
