import type { Component, VNodeData } from 'vue'
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
 * TODO:
 * 1. edit-table FromItem.prop 报错
 *    [Vue warn]: Error in mounted hook: "Error: please transfer a valid prop path to form item!"
 */

// ## 设计原则
// 1. jsx 属性最终兼容 import('vue').VNodeData
// 2. props.data、props.pagination 设计为单向数据流

// ## 属性分类
// 1. 组件属性             - 写在顶级
// 2. element-ui 属性     - 写在顶级
// 3. element-ui 事件     - 写在 on
// 4. html、vue 属性、事件 - 写在标签

const Tooltip = { ...ElementTooltip }
// 屏蔽 Tooltip.content 传入组件警告
// @ts-ignore
Tooltip.props.content.type = [String, Object]

export interface TableProps<RowType = Record<PropertyKey, any>> extends Partial<ElTable>, VNodeData {
  columns: (Partial<ElTableColumn> & {
    formItem?: Partial<ElFormItem> & VNodeData & {
      input?: Partial<ElInput> & VNodeData
      select?: Partial<ElSelect> & VNodeData & { options: (OptionRecord & VNodeData & Partial<ElOption>)[] }
      // render props(小)
      render?: (args: ({ key: string } & Parameters<TableColumn<RowType>['render']>[0])) => JSX_ELEMENT
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
}

export type TableColumn<RowType = Record<PropertyKey, any>> = TableProps<RowType>['columns'][number]
export type tableData<RowType = Record<PropertyKey, any>> = TableProps<RowType>['data'][number]
export type TableQuery<RowType = Record<PropertyKey, any>> = TableProps<RowType>['query']
export type TablePagination = Pick<TableProps['pagination'], 'currentPage' | 'pageSize' | 'total'>
export type TableHandle<RowType = Record<PropertyKey, any>> = TableProps<RowType>['handle']

const name = 'hb-ui-form-table'
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
  { $props: TableProps }
> = {
  name,
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
    $props: {
      // @ts-ignore
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    const props = this.$props as TableProps
    this.queryCount = 0

    // handle 挂载
    if (props.handle) {
      props.handle.query = this.queryHandle
      props.handle.form = this.$refs[name] as ElForm
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

      this.loading = true
      const result = await props.query({
        count: this.queryCount,
        pagination,
        payload: args.payload,
      })
      this.loading = false

      if (!result) return // 打断请求 or 无效请求

      const { data, ...pagination2 } = result
      this.formModel.tableData = data
      if (page2) {
        this.pagination2 = pagination2
      }
    },
  },
  render() {
    const _this = Object.assign(this, { $createElement: arguments[0] })
    const props = this.$props as TableProps

    return (
      <div class={name}>
        <Form
          ref={name}
          // https://github.com/ElemeFE/element/issues/20286
          {...{ props: { model: this.formModel } } as any}
        >
          <ElementTable
            v-loading={this.loading}
            data={this.formModel.tableData}
            {...mergeProps(props)}
          >
            {props.columns.map((column, index, columns) => (
              // 1. 修复 type=selection 复选排版错位 BUG
              // 2. 修复 type=other 更加可控的渲染
              column.type
                ? <ElementTableColumn {...{ props: column }}>{column.render}</ElementTableColumn>
                : <ElementTableColumn
                  {...{ props: withAutoFixed({ column, index, columns }) }}
                >
                  {renderColumn.call(_this, this.$refs[name], column, index)}
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
          {...mergeProps(props.pagination)}
        />}
      </div>
    )
  }
}

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
function renderColumn(
  handle: ElForm,
  column: TableColumn, 
  index: number
) {
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

  if (render) {
    node = render
  } else if (formItem) {
    const {
      render,
      input,
      select,
    } = formItem

    if (render) {
      // 自定义 FormItem 内组件
      node = args => {
        const key = formTableProp(args.$index, prop)
        return (
          // @ts-ignore
          <FormItem prop={key} {...mergeProps(formItem)}>
            {render({ ...args, key })}
          </FormItem>
        )
      }
    } else if (input) {
      const { placeholder = '请输入' } = input
      node = ({ row, $index }) => (
        // @ts-ignore
        <FormItem prop={formTableProp($index, prop)} {...mergeProps(formItem)}>
          {/*  @ts-ignore */}
          <Input clearable v-model={row[prop]} placeholder={placeholder} {...mergeProps(input)} />
        </FormItem>
      )
    } else if (select) {
      const { options, placeholder = '请选择' } = select
      node = ({ row, $index }) => {
        // const options = typeof opts === 'function' ? opts(args) : opts
        return (
          // @ts-ignore
          <FormItem prop={formTableProp($index, prop)} {...mergeProps(formItem)}>
            {/* @ts-ignore */}
            <Select clearable v-model={row[prop]} placeholder={placeholder} {...mergeProps(select)}>
              {options.map(option => <Option {...mergeProps(option)} />)}
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

  // 第一点击 log (TODO: 第一列是选框)
  if (index <= 0) {
    node = withClickColumnLog.call(this, node)
  }

  // Wrapped <Tooltip/>
  if (tooltip) {
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
  const { placement = 'top' } = tooltip

  return (obj: Parameters<TableColumn['render']>[0]) => {
    let n = ensureNodeValueVNode.call(this, render(obj))
    // @ts-ignore
    n = <Tooltip
      placement={placement}
      content={tooltip.render ? tooltip.render(obj) : obj.row[column.prop]}
      {...mergeProps(tooltip)}
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
  // https://github.com/ElemeFE/element/issues/12859#issuecomment-423838039
  return `tableData.${$index}.${prop}`
}

// 合并 VNodeData
function mergeProps(props?: Record<PropertyKey, any>): Record<PropertyKey, any> {
  // props、attrs 提升到顶级
  const merged: VNodeData = {
    props: { ...props, ...props?.props },
    attrs: { ...props, ...props?.attrs },
  }
  const keys = [
    'key',
    'slot',
    'scopedSlots',
    'ref',
    'refInFor',
    'tag',
    'staticClass',
    'class',
    'staticStyle',
    'style',
    'props',
    'attrs',
    'domProps',
    'hook',
    'on',
    'nativeOn',
    'transition',
    'show',
    'inlineTemplate',
    'directives',
    'keepAlive',
  ]

  for (const key of keys) {
    if (Object.keys(merged).includes(key)) continue
    if (!props?.[key]) continue
    merged[key] = props[key]
  }

  return merged
}

// TODO: @vue/composition-api 中返回的是 VueProxy
export default TableElementUI as any
