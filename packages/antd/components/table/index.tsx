import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  Form,
  Input,
  Select,
  Table,
} from 'antd'
import type { FormInstance, FormItemProps } from 'antd/es/form'
import type { InputProps } from 'antd/es/input'
import type { SelectProps } from 'antd/es/select'
import type {
  ColumnType as AntdColumnType,
  TablePaginationConfig,
  TableProps as AntdTableProps,
} from 'antd/es/table'

// 🚧-①: 屏蔽 React.StrictMode 副作用

export interface TableProps<RecordType = Record<string, any>> extends Omit<AntdTableProps<RecordType>, 'columns'> {
  columns?: (AntdColumnType<RecordType> & {
    formItem?: FormItemProps & {
      input?: InputProps
      select?: SelectProps
      // TODO: 其他 Form 元素
    }
  })[]
  query?: (args: {
    /** 请求次数，当不想自动发起首次请求时可以判断 count==1 返回 undefined 打断请求 - 内部维护 */
    count: number
    /** 与后端交互只需 `current` `pageSize` `total` 三个属性即可 */
    pagination?: Partial<Pick<TablePaginationConfig, 'current' | 'pageSize' | 'total'>>
    /** 来自 handle.query 透传 */
    payload?: any
  }) => Promise<({ data: RecordType[] } & Partial<Pick<TablePaginationConfig, 'current' | 'pageSize' | 'total'>>) | void>
  handle?: {
    query: (args?: Omit<Parameters<TableQuery<RecordType>>[0], 'count'>) => void
    // React 单项数据流设计，遂抛出 dataSource
    data: RecordType[]
    // forms: FormInstance[] // TODO: FormInstance<FormValues>
  }
}

export type TableColumn<RecordType = Record<string, any>> = TableProps<RecordType>['columns'][number]
export type TableQuery<RecordType = Record<string, any>> = TableProps<RecordType>['query']
export type TableHandle<RecordType = Record<string, any>> = TableProps<RecordType>['handle']

function TableAntd<RecordType = Record<string, any>, FormValues = Record<string, any>>(props: TableProps<RecordType>) {
  const {
    columns,
    dataSource,
    handle,
    query,
    onChange,
    pagination: props_pagination,
    ...rest
  } = props

  const [data, setData] = useState(dataSource)
  const [page, setPage] = useState<TablePaginationConfig | false>(props_pagination === false ? false : {
    showQuickJumper: true,
    ...props_pagination,
  })
  const queryCount = useRef(0)
  const mounted = useRef(false)
  const unMounted = useRef(false)
  useLayoutEffect(() => { unMounted.current = false }, []) // 🚧-①

  // 请求
  const queryHandle = async (args: Parameters<TableHandle['query']>[0] = {}) => {
    if (!query) return
    queryCount.current++

    const pagination = args.pagination ?? (typeof page === 'object' ? {
      current: page.current,
      pageSize: page.pageSize,
      total: page.total,
    } : undefined)

    const result = await query({
      count: queryCount.current,
      pagination,
      payload: args.payload
    })
    if (!result) return // 打断请求 or 无效请求

    if (unMounted.current) return // 🚧-①

    const { data, ...restPage } = result
    setData(data)
    if (typeof page === 'object') {
      setPage({ ...page, ...restPage })
    }
  }

  // 外部传入 dataSource
  useEffect(() => { mounted.current && setData(dataSource) }, [dataSource])

  // handle 挂载
  useEffect(() => {
    if (handle) {
      handle.query = queryHandle
      handle.data = data as RecordType[]
    }
  }, [handle, data])

  // init
  useEffect(() => {
    queryHandle()
  }, [])

  // componentDidMount
  useEffect(() => {
    mounted.current = true

    return () => { // 🚧-①
      queryCount.current = 0
      mounted.current = false
      unMounted.current = true
    }
  }, [])

  const tableProps: AntdTableProps<RecordType> = {
    size: 'small',
    columns: editComponents.withOnCell(columns),
    dataSource: data,
    onChange(pagination, filters, sorter, extra) {
      onChange?.(pagination, filters, sorter, extra)

      // works without `props.query`
      // !query && setPage(pagination)

      const { current, pageSize, total } = pagination
      queryHandle({ pagination: { current, pageSize, total } })
    },
    pagination: page,
    ...rest,
  }

  return (
    <Table components={editComponents()} {...tableProps as any} />
  )
}

export default TableAntd

// -----------------------------------------------------------------------------

// 🚧-②: 暂时屏蔽报错
// Warning: Cannot update a component (`InternalFormItem`) while rendering a different component (`Unknown`).

/**
 * 可编辑表格实现
 * @see https://ant.design/components/table/#components-table-demo-edit-cell
 */
function editComponents<RecordType = Record<string, any>, FormValues = Record<string, any>>(
  args: {
    onFieldChange?: (args: { key: string; value: any; index: number }) => void,
  } = {},
): AntdTableProps<RecordType>['components'] {
  // 每行独立一个 FormInstance
  const EditableContext = React.createContext({} as FormInstance)

  return {
    body: {
      row: props => {
        // TODO: 考虑支持外部传入 FormInstance 达到完全可控
        const [form] = Form.useForm()
        return (
          <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
              <tr {...props} />
            </EditableContext.Provider>
          </Form>
        )
      },
      cell: ({
        column,
        record,
        index,

        children,
        ...restProps
      }) => {
        let childNode = children

        // title 列无 record
        if (record) {
          const form = useContext<FormInstance<FormValues>>(EditableContext)
          const { dataIndex, formItem } = (column || {}) as TableColumn<RecordType>
          const key = dataIndex as string

          // 初始化数据同步到 Form 中 - 回填数据
          // 在 Antd 提供的 Demo 中点击可编辑 cell 时触发 form.setFieldsValue 规避频繁触发
          form.setFieldsValue({ [key]: record[key] } as any)

          if (formItem) {
            const {
              input,
              select,
              // TODO: 其他 Form 元素
            } = formItem as TableColumn<RecordType>['formItem']

            // 当前列为 Form 元素，将原数据备份到 dataIndex_old 中
            const backupKey = key + '_old'
            if (record[backupKey] === undefined) {
              record[backupKey] = record[key]
            }

            if (input) {
              const { onInput, onBlur, ...restInput } = input
              childNode = (
                <Form.Item name={key} {...formItem}>
                  <Input
                    allowClear
                    placeholder='请输入'
                    onInput={event => {
                      onInput?.(event)
                      record[key] /* 软更新 🚧-② */ = (event.target as any).value
                    }}
                    onBlur={event => {
                      onBlur?.(event)
                      args.onFieldChange?.({ key, value: event.target.value, index })
                    }} // 硬更新
                    {...restInput}
                  />
                </Form.Item>
              )
            } else if (select) {
              const { onChange, ...restSelect } = select
              childNode = (
                <Form.Item name={key} {...formItem}>
                  <Select
                    allowClear
                    placeholder='请选择'
                    onChange={(value, option) => {
                      onChange?.(value, option)
                      record[key] /* 软更新 🚧-② */ = value
                      args.onFieldChange?.({ key, value, index }) // 硬更新
                    }}
                    {...restSelect}
                  />
                </Form.Item>
              )
            }
          }
        }

        return <td {...restProps}>{childNode}</td>
      },
    },
  }
}
editComponents.withOnCell = function onCell<RecordType = Record<string, any>>(columns: TableColumn<RecordType>[]): typeof columns {
  return columns.map(column => ({
    ...column,
    // 透传至 components.body.cell
    onCell: (record, index) => ({
      column,
      record,
      index,
    } as any),
  }))
}
