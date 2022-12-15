import {
  type Ref,
  defineComponent,
  ref,
  reactive,
} from 'vue'
import { Table } from 'ant-design-vue'
import type { TablePaginationConfig, TableProps as AntdTableProps } from 'ant-design-vue/es/table'

// Like React useRef
function useRef<T = undefined>(): { current: T }
function useRef<T = undefined>(current: T): { current: T }
function useRef(...args: any[]) {
  return { current: args[0] }
}

export interface TableProps<RecordType = any> extends AntdTableProps<RecordType> {
  query?: (args: {
    /**
     * @内部维护
     * 请求次数，当不想自动发起首次请求时可以判断 count==1 返回 undefined 打断请求
     */
    count: number
    /** 与后端交互只需 `current` `pageSize` `total` 三个属性即可 */
    pagination?: Partial<Pick<TablePaginationConfig, 'current' | 'pageSize' | 'total'>>
    /** 来自 handle.query 透传 */
    payload?: any
  }) => Promise<({ data: RecordType[] } & Partial<Pick<TablePaginationConfig, 'current' | 'pageSize' | 'total'>>) | void>
  handle?: {
    /** 可用请求、刷新表格 */
    query: (args?: Omit<Parameters<TableQuery<RecordType>>[0], 'count'>) => void
    /** Table 数据源 */
    data?: Ref<RecordType[] | undefined>
  }
}

export type TableQuery<RecordType = any> = Required<TableProps<RecordType>>['query']
export type TableHandle<RecordType = any> = Required<TableProps<RecordType>>['handle']

export default defineComponent<TableProps>({
  setup(_props, ctx) {
    const {
      columns,
      dataSource: dataSource2,
      handle,
      query,
      onChange,
      pagination: props_pagination,
      ...rest
    } = ctx.attrs as TableProps

    const dataSource = ref(dataSource2)
    const pagination = props_pagination === false ? false : reactive<TablePaginationConfig>({
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      showSizeChanger: true,
      ...props_pagination,
    })
    const loading = ref(false)
    const queryCount = useRef(0)
    const queryArgs = useRef<Parameters<TableHandle['query']>[0]>() // query's args cache

    // 请求
    const queryHandle = async (args: Parameters<TableHandle['query']>[0] = {}) => {
      if (!query) return
      queryCount.current++
      queryArgs.current = args

      const argsPagination = args.pagination ?? (typeof pagination === 'object' ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
      } : undefined)

      // useless attr
      delete argsPagination?.total

      loading.value = true
      const result = await query({
        count: queryCount.current,
        pagination: argsPagination,
        payload: args.payload,
      })
      loading.value = false
      if (!result) return // 打断请求 or 无效请求

      const { data, ...restPage } = result
      dataSource.value = data
      if (typeof pagination === 'object') {
        Object.assign(pagination, restPage)
      }
    }

    // watch(dataSource2) 🤔

    // handle 挂载
    if (handle) {
      handle.query = (args = {}) => {
        if (pagination) {
          args.pagination = {
            // Reset `pagination.current` to 1 when invoke `handle.query`
            current: 1,
            pageSize: queryArgs.current?.pagination?.pageSize ?? pagination.pageSize,
            ...args.pagination,
          }
        }
        queryHandle(args)
      }
      handle.data = dataSource
    }

    // init
    queryHandle()

    // render
    return () => {
      // `dataSource`, `pagination` will update the value multiple times.
      // `tableProps` need to be placed in the `render` to be updated(multiple executions), and will only be executed once in `setup`.
      const tableProps: AntdTableProps = {
        loading: loading.value,
        dataSource: dataSource.value,
        onChange(pagination, filters, sorter, extra) {
          onChange?.(pagination, filters, sorter, extra)

          // 🚧 - 表格分页改变后强依赖 `props.query` 返回 pagination 的，而不是直接内部直接修改 - 单向数据流

          const { current, pageSize, total } = pagination
          queryHandle({
            pagination: { current, pageSize, total },
            // use last cache
            payload: queryArgs.current?.payload,
          })
        },
        // @ts-ignore
        rowKey: (_, index) => index!, // Expect to pass from props!
        pagination,
        ...rest,
      }

      return <Table {...tableProps} />
    }
  },
})
