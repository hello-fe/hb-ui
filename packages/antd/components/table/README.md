# Table

Table 组件是对 antd 提供的 Table 组件的非侵入式扩展，它完全兼容 antd 的 Table，你甚至可以用你熟悉的使用 Table 方式使用它

## TableProps

`TableProps` 继承自 `import('antd/es/table').TableProps` ，可以全量支持 antd 提供的  Table 选项并扩展了下面的一些属性

- `columns` 即是对 antd 提供的 Table 中 columns 的扩展

  ```ts
  type ColumnType = import('antd/es/table').ColumnType & {
    formItem?: FormItemProps & {
      input?: InputProps | ((args: { form: FormInstance, record: RecordType, index: number }) => InputProps | void | null | undefined)
      select?: SelectProps | ((args: { form: FormInstance, record: RecordType, index: number }) => SelectProps | void | null | undefined)
      // 🐞-①: render props(小)
      render?: (args: { form: FormInstance, record: RecordType, index: number }) => React.ReactNode
    }
    // 🐞-①: render function(大) - Consider use `render` instead.
  }
  ```

- `query` 自动化请求，会在 首次选软、分页变化、主动调用`query` 三种情况下触发

  ```ts
  type Query = (args: {
    /** 请求次数，当不想自动发起首次请求时可以判断 count==1 返回 undefined 打断请求 - 内部维护 */
    count: number
    /** 与后端交互只需 `current` `pageSize` `total` 三个属性即可 */
    pagination?: Partial<Pick<TablePaginationConfig, 'current' | 'pageSize' | 'total'>>
    /** 来自 handle.query 透传 */
    payload?: any
  }) => Promise<({ data: RecordType[] } & Partial<Pick<TablePaginationConfig, 'current' | 'pageSize' | 'total'>>) | void>
  ```

- `handle` 挂载 Table 的方法与数据的句柄

## 使用案例

#### 基本使用

```ts
import { Table, TableProps } from '@hb-ui/antd'

export default = () => {
  const tableProps: TableProps = {
    async query(args) {
      console.log('-- 发起请求 --', JSON.parse(JSON.stringify(args)))

      // 用户可以根据自己的业务需求封装一个通用的 queryAdapter
      // 而不是每次都重复的在 query 中返回同样的样板代码
      const result = fetc('https://www.github.com/users')

      return {
        data: result.data,
        // 分页数据是可选的，根据业务是否需要分页
        total: 100,
        pageSize: args.pagination.pageSize,
        current: args.pagination.current,
      }
    },
    columns: [
      {
        title: '姓名',
        dataIndex: 'name',
      },
    ],
  }

  return <Table {...tableProps} />
}
```

#### 表格handle

```ts
import { Table, TableProps, TableHandle } from '@hb-ui/antd'

export default = () => {
  const handle = {} as TableHandle<RecordType>

  // 表格数据
  const tableData = () => {
    console.log('表格数据:', handle.data);
  }

  // 请求/刷新
  const tableQuery = () => {
    handle.query({ payload: {/* 传递一些参数 */} })
  }

  const tableProps: TableProps = {
    columns: [],
    handle,
    rowSelection: {} // 开启可选择
  }

  return (
    <>
      <button onClick={tableData}>获取表格数据</button>
      <button onClick={tableQuery}>发起请求/刷新</button>
      <Table {...tableProps} />
    </>
  )
}
```

#### 可编辑表格

通过传递 `formItem` 属性开启可编辑表格

```ts
const tableProps: TableProps = {
  columns: [
    {
      title: '姓名',
      dataIndex: 'name',
      formItem: {
        input: {},
        rules: [{ required: true, message: '请输入姓名！' }],
      },
    },
  ],
}
```
