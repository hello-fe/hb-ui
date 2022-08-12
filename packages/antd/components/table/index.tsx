import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  Form,
  Table,
  Tooltip,
} from 'antd'
import type { FormInstance } from 'antd/es/form'
import type { InputProps as AntdInputProps } from 'antd/es/input'
import type { SelectProps as AntdSelectProps } from 'antd/es/select'
import type {
  ColumnType as AntdColumnType,
  TablePaginationConfig,
  TableProps as AntdTableProps,
} from 'antd/es/table'
import type { TooltipProps } from 'antd/es/tooltip'
import type {
  KVA,
} from '../../types/common'

// 🚧-①: 屏蔽 React.StrictMode 副作用

export interface TableProps<RecordType = KVA> extends Omit<AntdTableProps<RecordType>, 'columns'> {
  columns?: (AntdColumnType<RecordType> & {
    // TODO: Form 表单元素
    input?: AntdInputProps
    select?: AntdSelectProps

    // tooltip?: TooltipProps
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
    form: FormInstance // TODO: FormInstance<FormValues>
  }
}

export type TableColumn<RecordType = KVA> = TableProps<RecordType>['columns'][0]
export type TableQuery<RecordType = KVA> = TableProps<RecordType>['query']
export type TableHandle<RecordType = KVA> = TableProps<RecordType>['handle']

function TableAntd<RecordType = KVA, FormValues = KVA>(props: TableProps<RecordType>) {
  const {
    columns,
    dataSource,
    handle,
    query,
    onChange,
    pagination: props_pagination,
    ...omit
  } = props

  const [data, setData] = useState(dataSource)
  const [page, setPage] = useState(props_pagination)
  const [form] = Form.useForm<FormValues>()
  const queryCount = useRef(0)
  const mounted = useRef(false)
  const unMounted = useRef(false)
  useLayoutEffect(() => { unMounted.current = false }, []) // 🚧-①

  // 请求
  const queryHandle = async (args: Parameters<TableHandle['query']>[0] = {}) => {
    if (!query) return
    queryCount.current++

    const result = await query({
      count: queryCount.current,
      pagination: page ? page : undefined,
      payload: args.payload
    })
    if (!result) return // 打断请求 or 无效请求

    if (unMounted.current) return // 🚧-①

    const { data, ...omitPage } = result
    setData(data)
    if (page) {
      setPage({ ...page, ...omitPage })
    }
  }

  // 外部传入 dataSource
  useEffect(() => { mounted.current && setData(dataSource) }, [dataSource])

  // handle 挂载
  useEffect(() => {
    if (handle) {
      handle.query = queryHandle
      handle.form = form
    }
  }, [handle])

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
    columns,
    dataSource: data,
    onChange(pagination, filters, sorter, extra) {
      onChange?.(pagination, filters, sorter, extra)
      setPage(pagination)
      queryHandle()
    },
    pagination: page,
    ...omit,
  }

  return (
    <Table {...tableProps as any} />
  )
}

/*
2022-08-02: 暂不扩展，在 tsx 下 antd 提供的 render 足够灵活
function renderColumn(column: TableColumn, index: number, columns: TableColumn[]): TableColumn {
  const {
    input,
    select,
    tooltip,
  } = column
  let render: TableColumn['render']
  if (input) {
    // TODO: implementation
  } else if (select) {
  } else if (tooltip) {
    render = (value, record, index) => (
      <Tooltip
        placement='top'
        title={value}
        {...tooltip}
      >
        {value}
      </Tooltip>
    )
  }
  if (render) {
    const originalRender = column.render
    column.render = (value, record, index) => {
      const rendered = render(value, record, index)
      return originalRender ? originalRender(rendered, record, index) : rendered
    }
  }
  return column
}
*/

export default TableAntd
