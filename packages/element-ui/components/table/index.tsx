import type { Component } from 'vue'
import {
  Form,
  FormItem,
  Input,
  Select,
  Option,
  Pagination,
  Table as ElementTable,
  TableColumn as ElementTableColumn,
  Tooltip as ElementTooltip,
} from 'element-ui'
import type { ElForm } from 'element-ui/types/form'
import type { ElFormItem } from 'element-ui/types/form-item'
import type { ElInput } from 'element-ui/types/input'
import type { ElOption } from 'element-ui/types/option'
import type { ElSelect } from 'element-ui/types/select'
import type { ElTable } from 'element-ui/types/table'
import type { ElTooltip } from 'element-ui/types/tooltip'
import type { ElTableColumn } from 'element-ui/types/table-column'
import type { ElPagination } from 'element-ui/types/pagination'
import type { OptionRecord, JSX_ELEMENT } from '../types'

/**
 * props.data、props.pagination 设计为单向数据流
 */

const Tooltip = { ...ElementTooltip }
// 屏蔽 Tooltip.content 传入组件警告
// @ts-ignore
Tooltip.props.content.type = [String, Object]

export interface TableProps<RowType = Record<PropertyKey, any>> {
  columns: (Partial<ElTableColumn> & Record<PropertyKey, any> & {
    formItem?: Partial<ElFormItem> & {
      input?: Partial<ElInput>
      select?: Partial<ElSelect> & {
        options:
        | (OptionRecord & Partial<ElOption>)[]
        | ((...args: Parameters<TableColumn<RowType>['render']>) => (OptionRecord & Partial<ElOption>)[])
      }
      // TODO: 其他 Form 元素
    }

    tooltip?: Partial<ElTooltip & {
      /** 自定义渲染 content 支持 JSX.Element */
      render: TableColumn<RowType>['render']
    }>
    render?: (props: {
      $index: number
      /** 当前列属性 */
      column: TableColumn<RowType>
      /** 当前列数据 */
      row: RowType
    }) => JSX_ELEMENT
  })[]
  data?: RowType[]
  /** 返回 undefined 代表打断请求 */
  query?: (args: {
    /** 请求次数，当不想自动发起首次请求时可以判断 count==1 返回 undefined 打断请求 */
    count: number
    pagination?: TablePagination
    /** 来自 handle.query 透传 */
    payload?: any
  }) => Promise<({ data: RowType[] } & TablePagination) | undefined>
  /** 关闭分页传递 null (false 会引起 TablePagination 类型推导问题) */
  pagination?: null | {
    /** Current page number */
    currentPage: number
    /** Item count of each page */
    pageSize: number
    /** Total item count */
    total: number
    /** 泛化 */
    props?: Partial<ElPagination & Record<PropertyKey, any>>
  }
  handle?: {
    query: (args?: Omit<Parameters<TableQuery<RowType>>[0], 'count'>) => void
    form: ElForm
  }
  /** 泛化 */
  props?: Partial<ElTable & Record<PropertyKey, any>>
}

export type TableColumn<RowType = Record<PropertyKey, any>> = TableProps<RowType>['columns'][number]
export type tableData<RowType = Record<PropertyKey, any>> = TableProps<RowType>['data'][number]
export type TableQuery<RowType = Record<PropertyKey, any>> = TableProps<RowType>['query']
export type TablePagination = Pick<TableProps['pagination'], 'currentPage' | 'pageSize' | 'total'>
export type TableHandle<RowType = Record<PropertyKey, any>> = TableProps<RowType>['handle']

// 这里与 export default 类型并不匹配，Vue2 提供的 ts 并不完整
const TableElementUI: Component<
  () => {
    loading: boolean,
    formModel: {
      tableData: tableData[]
    },
    pagination2?: Partial<Pagination>
  },
  {
    onCurrentChange: (current: number) => void,
    onSizeChange: (size: number) => void,
    queryHandle: () => void,
  },
  Record<PropertyKey, any>,
  TableProps
> = {
  name: 'hb-ui-table',
  data() {
    return {
      loading: false,
      formModel: {
        tableData: [],
      },
      // 默认的 pagination 配置
      pagination2: { currentPage: 1, pageSize: 10, total: 0 },
    }
  },
  props: {
    columns: {
      // @ts-ignore
      type: Array,
      default: () => [],
    },
    // @ts-ignore
    data: [Object, Array],
    // @ts-ignore
    query: Function,
    // @ts-ignore
    pagination: [Object, null],
    // @ts-ignore
    handle: Object,
  },
  mounted() {
    const props = this.$props as TableProps
    this.queryCount = 0

    if (props.handle) {
      props.handle.query = this.queryHandle
      props.handle.form = this.$refs['hb-ui-table-form'] as ElForm
    }

    this.queryHandle()
  },
  watch: {
    data: {
      handler(d) {
        // 合并传入参数
        d && (this.formModel.tableData = d)
      },
      immediate: true,
    },
    pagination: {
      handler(pagination) {
        // 合并传入参数
        pagination !== undefined && (this.pagination2 = pagination)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    onCurrentChange(current) {
      // TODO: 与 `queryHandle` 中的 `this.pagination2 = pagination2` 操作重复。如果 `query` 返回 fase 会造成操作“非幂等”
      this.pagination2.currentPage = current
      this.queryHandle()
    },
    onSizeChange(size) {
      // TODO: 与 `queryHandle` 中的 `this.pagination2 = pagination2` 操作重复。如果 `query` 返回 fase 会造成操作“非幂等”
      this.pagination2.pageSize = size
      this.queryHandle()
    },
    async queryHandle(args: Parameters<TableHandle['query']>[0] = {}) {
      const props = this.$props as TableProps
      const page2 = this.pagination2 as TablePagination

      if (!props.query) return
      this.queryCount++
      const pagination = args.pagination ?? (page2 ? {
        currentPage: page2.currentPage,
        pageSize: page2.pageSize,
        total: page2.total,
      } : undefined)

      const result = await props.query({
        count: this.queryCount,
        pagination,
        payload: args.payload,
      })
      if (!result) return // 打断请求 or 无效请求

      const { data, ...pagination2 } = result
      this.formModel.tableData = data
      if (page2) {
        this.pagination2 = pagination2
      }
    },
  },
  render() {
    const props = this.$props as TableProps
    const _this = Object.assign(this, { $createElement: arguments[0] })

    return (
      <div class="hb-ui-table">
        <Form
          // @ts-ignore
          ref="hb-ui-table-form"
          // https://github.com/ElemeFE/element/issues/20286
          {...{ props: { model: this.formModel } } as any}
        >
          <ElementTable
            v-loading={this.loading}
            data={this.formModel.tableData}
            on-selection-change={props.props?.['on-selection-change'] || noop}
            {...{ props: props.props }}
          >
            {props.columns.map((column, index, columns) => (
              // 1. 修复 type=selection 复选排版错位 BUG
              // 2. 修复 type=other 更加可控的渲染
              column.type
                ? <ElementTableColumn {...{ props: column }}>{column.render}</ElementTableColumn>
                : <ElementTableColumn
                  {...{ props: withAutoFixed({ column, index, columns }) }}
                >
                  {renderColumn.call(_this, column, index)}
                </ElementTableColumn>
            ))}
          </ElementTable>
        </Form>
        {props.pagination !== null && <Pagination
          // @ts-ignore
          background
          style="margin-top:15px;text-align:right;"
          layout="total, sizes, prev, pager, next, jumper"
          page-sizes={[10, 20, 50, 100, 200, 500]}
          current-page={this.pagination2.currentPage}
          page-size={this.pagination2.pageSize}
          total={this.pagination2.total}
          on-current-change={this.onCurrentChange}
          on-size-change={this.onSizeChange}
          {...{ props: props.pagination?.props }}
        />}
      </div>
    )
  }
}

function noop() { }

// 最后一列如果是 "操作" 自动右侧固定
function withAutoFixed(args: {
  column: TableColumn
  index: number
  columns: TableColumn[]
}): TableColumn {
  if (args.index === args.columns.length - 1 && args.column.label === '操作') {
    if (!Object.keys(args.column).includes('fixed')) {
      args.column.fixed = 'right'
    }
  }
  return args.column
}

// 渲染表格单元格，如果返回值是 Function 那么相当于 Vue 的 slot
function renderColumn(column: TableColumn, index: number) {
  // 编译后的 jsx 需要使用 h 函数
  const h = this.$createElement
  const {
    prop,
    formItem,
    tooltip,
    render,
  } = column

  // 🤔 The `node` should always be render-function
  let node: TableColumn['render']

  if (typeof render === 'function') {
    node = render
  } else if (typeof formItem === 'object') {
    const {
      input,
      select,
      ...restFormItem
    } = formItem

    if (typeof input === 'object') {
      const { placeholder = '请输入', ...restInput } = input
      node = ({ row, $index }) => (
        // @ts-ignore
        <FormItem prop={formTableProp($index, prop)} {...{ props: restFormItem }}>
          {/*  @ts-ignore */}
          <Input clearable v-model={row[prop]} placeholder={placeholder} {...{ props: restInput }} />
        </FormItem>
      )
    } else if (typeof select === 'object') {
      const { options: opts, placeholder = '请选择', ...restSelect } = select
      node = args => {
        const { row, $index } = args
        const options = typeof opts === 'function' ? opts(args) : opts
        return (
          // @ts-ignore
          <FormItem prop={formTableProp($index, prop)} {...{ props: restFormItem }}>
            {/* @ts-ignore */}
            <Select clearable v-model={row[prop]} placeholder={placeholder} {...{ props: restSelect }}>
              {/* @ts-ignore */}
              {options.map((opt, idx) => <Option key={idx} {...{ props: opt }} />)}
            </Select>
          </FormItem>
        )
      }
    }
  }

  // render raw string
  if (!node) {
    node = ({ row }) => <span>{row[prop]}</span>
  }

  // 前两列可以点击(第一列有时候是选框)
  if (index <= 1) {
    node = withClickColumnLog.call(this, node)
  }

  // Wrapped <Tooltip/>
  if (typeof tooltip === 'object') {
    node = withTooltip.call(this, column, node, tooltip)
  }

  return node
}

// 点击行输出 log
function withClickColumnLog(render: TableColumn['render']) {
  return (obj: Parameters<TableColumn['render']>[0]) => {
    const n = ensureNodeValueVNode.call(this, render(obj))
    if (!n.data) { n.data = {} }
    if (!n.data.on) { n.data.on = {} }
    const originClick = n.data.on.click
    n.data.on.click = (...args) => {
      // Keep origin onClick
      if (originClick) {
        if (typeof originClick === 'function') {
          originClick(...args)
        } else {
          originClick.forEach((fn) => fn(...args))
        }
      }
      // 将当前行输出到 log
      console.log(JSON.parse(JSON.stringify(obj.row)))
    }
    return n
  }
}

function withTooltip(
  column: TableColumn,
  render: TableColumn['render'],
  tooltip: TableColumn['tooltip'],
) {
  // 编译后的 jsx 需要使用 h 函数
  const h = this.$createElement
  const style = 'overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
  const { placement = 'top', ...rest } = tooltip

  return (obj: Parameters<TableColumn['render']>[0]) => {
    let n = ensureNodeValueVNode.call(this, render(obj))
    // @ts-ignore
    n = <Tooltip
      placement={placement}
      content={tooltip.render ? tooltip.render(obj) : obj.row[column.prop]}
      {...{ props: rest }}
    >
      <div style={style}>{n}</div>
    </Tooltip>
    return n
  }
}

// 确保渲染内容总是被标签包裹
function ensureNodeValueVNode(node: JSX_ELEMENT, tag = 'span') {
  return (node == null || typeof node !== 'object')
    ? this.$createElement(tag, node)
    : node
}

function formTableProp($index: number, prop: string) {
  // 🚧-①: 格式必须是 data.index.prop | data[index]prop 无效
  return `tableData.${$index}.${prop}`
}

// TODO: @vue/composition-api 中返回的是 VueProxy
export default TableElementUI as any
