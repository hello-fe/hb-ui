import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
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
      // render props(小)
      render?: (...args: Parameters<AntdColumnType<RecordType>['render']>) => JSX.Element
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
    /** 可编辑表格每一行都是一个独立的 Form */
    forms: FormInstance[]
    /** 可编辑表格重置 */
    resetForms: () => void
  }
}

export type TableColumn<RecordType = Record<string, any>> = TableProps<RecordType>['columns'][number]
export type TableQuery<RecordType = Record<string, any>> = TableProps<RecordType>['query']
export type TableHandle<RecordType = Record<string, any>> = TableProps<RecordType>['handle']

// Table 的可编辑表格的表单组件样式(对齐单元格)
function formatStyle() {
  const id = 'tr-form-item_style'
  const className = 'tr-form-item'
  let oStyle = document.getElementById(id) as HTMLStyleElement
  if (oStyle) return

  oStyle = document.createElement<'style'>('style')
  oStyle.id = id
  oStyle.innerHTML = `.${className} .ant-form-item { margin: 0; }`
  document.head.appendChild(oStyle)
}

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
    pageSize: 10,
    current: 1,
    ...props_pagination,
  })
  const [loading, setLoading] = useState(false)
  const queryCount = useRef(0)
  const queryArgs = useRef<Parameters<TableHandle['query']>[0]>() // query's args cache
  const mounted = useRef(false)
  const unMounted = useRef(false)
  const editable = useMemo(() => columns.find(col => col.formItem), [columns])

  useLayoutEffect(() => {
    unMounted.current = false // 🚧-①
    formatStyle()
  }, [])

  // 请求
  const queryHandle = async (args: Parameters<TableHandle['query']>[0] = {}) => {
    if (!query) return
    queryCount.current++

    const pagination = args.pagination ?? (typeof page === 'object' ? {
      current: page.current,
      pageSize: page.pageSize,
      total: page.total,
    } : undefined)

    setLoading(true)
    const result = await query({
      count: queryCount.current,
      pagination,
      payload: args.payload,
    })
    setLoading(false)
    if (!result) return // 打断请求 or 无效请求

    if (unMounted.current) return // 🚧-①

    const { data, ...restPage } = result
    setData(data)
    if (typeof page === 'object') {
      setPage({ ...page, ...restPage })
    }
  }

  // 外部传入 dataSource
  useEffect(() => {
    // initialized in `useState(dataSource)`
    mounted.current && setData(dataSource)
  }, [dataSource])

  // handle 挂载
  useEffect(() => {
    if (handle) {
      handle.query = args => {
        // Reset `pagination.current` to 1 when invoke `handle.query`
        args.pagination = { current: 1, ...args.pagination }
        queryArgs.current = args
        queryHandle(args)
      }
      handle.data = data as RecordType[]
      handle.forms = []
      handle.resetForms = () => {
        // 🤔 出于性能及编程复杂度考虑，不使用 FormAPI 同步 dataSource，直接在此更新
        setData(resetDataSource(data))
        for (const form of handle.forms) {
          form.resetFields()
        }
      }
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

  const tableProps: AntdTableProps<RecordType> = editComponents.withOnRow({
    size: 'small',
    columns: editComponents.withOnCell(columns),
    dataSource: data,
    onChange(pagination, filters, sorter, extra) {
      onChange?.(pagination, filters, sorter, extra)

      // works without `props.query`
      // !query && setPage(pagination)

      const { current, pageSize, total } = pagination
      queryHandle({
        pagination: { current, pageSize, total },
        // use last cache
        payload: queryArgs.current?.payload,
      })
    },
    pagination: page,
    ...rest,
  })

  return (
    <Table
      components={editable ? editComponents({ handle }) : undefined}
      loading={loading}
      {...tableProps as any}
    />
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
    handle: TableHandle<RecordType>,
    onFieldChange?: (args: { key: string; value: any; index: number }) => void,
  },
): AntdTableProps<RecordType>['components'] {
  // 每行独立一个 FormInstance

  return {
    body: {
      row: ({
        record,
        index,

        className: CN,
        ...rest
      }) => {
        const className = CN + ' tr-form-item'

        if (typeof index === /* <thead> */'undefined') {
          return <tr className={className} {...rest} />
        }

        // TODO: 考虑支持外部传入 FormInstance 达到完全可控
        const [form] = Form.useForm(args.handle.forms[index])
        // 抛出 FormInstance
        args.handle.forms[index] = form
        const values = (rest.children as Record<string, any>[])
          .map(child => child.props.additionalProps.column as TableColumn<RecordType>)
          .filter(column => column.formItem)
          /**
           * Expected ")" but found "as"
           *   at failureErrorWithLog (/node_modules/esbuild/lib/main.js:1615:15)
           * .map(column => column.dataIndex /* Only support string *\/ as string)
           */
          .map(column => column.dataIndex as /* Only support string */ string)
          .reduce((memo, key) => Object.assign(memo, { [key]: record[key] }), {})

        return (
          <Form
            form={form}
            component={false}
            initialValues={values}
          >
            <tr className={className} {...rest} />
          </Form>
        )
      },
      cell: ({
        column,
        record,
        index,

        children,
        ...rest
      }) => {
        let childNode = children

        // title 列无 record
        if (record) {
          const { dataIndex, formItem } = (column || {}) as TableColumn<RecordType>
          const key = dataIndex as string

          if (formItem) {
            const {
              input,
              select,
              render,
            } = formItem as TableColumn<RecordType>['formItem']

            // 当前列为 Form 元素，将原数据备份到 dataIndex_old 中
            const backupKey = key + '_old'
            if (!Object.keys(record).includes(backupKey)) {
              record[backupKey] = record[key]
            }

            if (render) {
              childNode = (
                <Form.Item name={key} {...formItem}>
                  {render(record[key], record, index)}
                </Form.Item>
              )
            } else if (input) {
              const { onChange, onBlur, ...restInput } = input
              childNode = (
                <Form.Item name={key} {...formItem}>
                  <Input
                    allowClear
                    placeholder='请输入'
                    onChange={event => {
                      onChange?.(event)
                      record[key] /* 软更新 🚧-② */ = (event.target as any).value
                    }}
                    onBlur={event => {
                      onBlur?.(event)
                      args.onFieldChange?.({ key, value: event.target.value, index }) // 硬更新
                    }}
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

        return <td {...rest}>{childNode}</td>
      },
    },
  }
}
editComponents.withOnCell = function onCell<RecordType = Record<string, any>>(columns: TableColumn<RecordType>[]): typeof columns {
  return columns.map(column => ({
    ...column,
    // 透传至 components.body.cell
    onCell: (record, index) => ({
      // TODO: const original = column.onCell
      column,
      record,
      index,
    } as any),
  }))
}
editComponents.withOnRow = function withOnRow<RecordType = Record<string, any>>(tableProps: TableProps<RecordType>): typeof tableProps {
  // Passed into components.body.row
  tableProps.onRow = function onRow(record, index) {
    // TODO: const original = tableProps.onRow
    return { record, index } as any
  }
  return tableProps
}

export function resetDataSource<RecordType = Record<string, any>>(data: TableProps<RecordType>['dataSource']) {
  return data.map(d => {
    const keys = Object.keys(d).filter(key => key.endsWith('_old'))
    for (const key of keys) {
      d[key.replace('_old', '')] = d[key]
    }
    return d
  })
}
