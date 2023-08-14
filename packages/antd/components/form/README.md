# Form

## FormProps

`FormProps` 继承自 `import('antd/es/form').FormProps` ，可以全量支持 antd 提供的  Form 选项并扩展了下面的一些属性

- `items[]` 会渲染成 antd 中 `Form.Item` 数组，`Item` 类型定义全兼容 `Form.Item` 并扩展了几个常用的 Form 元素

  ```ts
  type Item = import('antd/es/form').FormItemProps & {
    input?: import('antd/es/input').InputProps
    select?: import('antd/es/select').SelectProps
    datePicker?: import('antd/es/date-picker').DatePickerProps
    rangePicker?: import('antd/es/date-picker').RangePickerProps
    checkboxGroup?: import('antd/es/checkbox').CheckboxGroupProps
    radioGroup?: import('antd/es/radio').RadioGroupProps
    switch?: import('antd/es/switch').SwitchProps
    col?: import('antd/es/col').ColProps

    // render props(小)
    render?: (value: any, form: FormInstance<Values>) => React.ReactNode
  }
  ```

- `lastItem` 自定义 **提交/重置** 按钮
- `onSubmit` 点击提交触发事件
- `onFormReset` 点击重置触发事件
- `collapse` 当表格字段过多时，可以收起一部分字段
- `row` 多个 `<Form.Item />` 是通过 `<Row />` 布局的，这里支持传递 Row 选项
- `col` 批量个 `<Row />` 标签中的 `<Col />` 传递属性


## 使用案例

#### 基本使用

```ts
import { Form, FormProps } from '@hb-ui/antd'

export default = () => {
  const formProps: FormProps = {
    items: [
      {
        label: '文本字段',
        value: 'text',
        // 默认渲染 <Input /> 标签
      },
      {
        label: '选择字段',
        value: 'select',
        // 这代表渲染 <Select /> 标签
        select: {
          // 这里所有配置与 antd 的 <Select /> 标签相同
          options: [],
        },
      },
    ],
  }

  return <Form {...formProps} />
}
```

#### 自定义渲染

1. 保留 `<Form.Item />`

```ts
const formProps: FormProps = {
  items: [
    {
      label: '文本字段',
      value: 'text',
      render(value: any, form: FormInstance<Values>) {
        return <div>我是自定义渲染标签</div>
      },
    },
  ],
}
```

1. 不保留 `<Form.Item />`

```ts
const formProps: FormProps = {
  items: [
    // 使用 render 函数
    (index: number, form: FormInstance<Values>) => (
      <div>我是自定义渲染标签</div>
    ),
  ],
}
```

#### 自定义提交/重置

1. 保留 `<Form.Item />`

```ts
const formProps: FormProps = {
  lastItem: {
    // nodes 即原来的 提交/重置 按钮
    render(nodes: React.ReactNode[], form: FormInstance<Values>) {
      return <Button>我是新的按钮</Button>
    },
  },
}
```

2. 不保留 `<Form.Item />`

```ts
const formProps: FormProps = {
  lastItem(nodes: React.ReactNode[], form: FormInstance<Values>) {
    return <Button>我是新的按钮</Button>
  },
}
```

#### 自定义Row/Col布局

1. 批量自定义

```ts
const formProps: FormProps = {
  col: {
    span: 24 / 2,
  },
}
```

2. 单独自定义

```ts
const formProps: FormProps = {
  items: [
    {
      label: '文本字段',
      value: 'text',
      col: {
        span: 24 / 2,
      },
    },
  ],
}
