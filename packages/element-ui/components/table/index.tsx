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
import type { OptionRecord, JSX_ELEMENT } from '../types'

// ## 设计原则
// - jsx 属性最终兼容 import('vue').VNodeData
// - 只有扩展属性可以写到 “顶级”，其余属性需遵循 import('vue').VNodeData
// - 大部分情况下组件属性写在 props 中，少数情况如 Input 需要写在 attrs 中是因为 props 需要留给原生 input

// ## 简而言之
// - 事件写在 on 中
// - 自定义属性写在顶级
// - element-ui 组件属性写在 props 中
// - element-ui 组件属性写在 props 中不生效写在 attrs 中

const Tooltip = { ...ElementTooltip }
// 屏蔽 Tooltip.content 传入组件警告
// @ts-ignore
Tooltip.props.content.type = [String, Object]

export interface TableProps<RowType = Record<PropertyKey, any>> extends Partial<ElTable>, VNodeData {
  /** @override */
  props?: Partial<ElTable>,
  columns: (Partial<ElTableColumn> & {
    /** @override */
    props?: Partial<ElTableColumn>,
    formItem?: VNodeData & {
      /** @override */
      props?: Partial<ElFormItem>,
      input?: VNodeData & {
        /** @override */
        attrs?: Partial<ElInput>
      }
      select?: VNodeData & {
        /** @override */
        props?: Partial<ElSelect>
        options: (OptionRecord & VNodeData & Partial<ElOption>)[]
      }
      // render props(小)
      render?: (args: ({ key: string } & Parameters<TableColumn<RowType>['render']>[0])) => JSX_ELEMENT
    }

    tooltip?: VNodeData & {
      /** @override */
      props?: Partial<ElTooltip>
      /** 自定义渲染 content 支持 JSX.Element */
      render?: TableColumn<RowType>['render']
    }
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
    /**
     * @type {import('vue').VNodeData & import('element-ui/types/pagination').ElPagination}
     * TableProps['pagination'] 算扩展属性不打算显示的标注 ElPagination 类型降低心智负担，但支持全部 ElPagination。
     */
    [key: string]: any
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
// props.data, props.pagination 设计为单向数据流
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
    '$props.data': {
      handler(d) {
        // 合并传入参数
        d && (this.formModel.tableData = d)
      },
      immediate: true,
    },
    '$props.pagination': {
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
    Object.assign(this, { $createElement: arguments[0] })
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
            // [Vue warn]: Error in mounted hook: "Error: please transfer a valid prop path to form item!"
            {...mergeProps(props, {
              // `data` has been extracted in `watch` hook
              props: CP.Table.props.filter(p => p !== 'data'),
            })}
          >
            {props.columns?.map(function mapColumn(column: TableColumn, index: number, columns: TableColumn[]) {
              column = mergeProps(column, { props: CP.TableColumn.props })
              const typedColumn = column.type && column.type !== 'default'
              // 第一点击 log
              if (!mapColumn['_click_to_log'] && !typedColumn) {
                Object.assign(mapColumn, { _click_to_log: true })
                Object.assign(column, { _click_to_log: true })
              }
              return (
                // 1. 修复 type=selection 复选排版错位 BUG
                // 2. 修复 type=other 更加可控的渲染
                typedColumn
                  ? <ElementTableColumn {...column as any}>{column.render}</ElementTableColumn>
                  : <ElementTableColumn {...withAutoFixed({ column, index, columns }) as any}>
                    {renderColumn.call(this, this.$refs[name], column, index)}
                  </ElementTableColumn>
              )
            }.bind(this))}
          </ElementTable>
        </Form>
        {props.pagination !== null && <Pagination
          background
          style="margin-top:15px;text-align:right;"
          layout="total, sizes, prev, pager, next, jumper"
          page-sizes={[10, 20, 50, 100, 200, 500]}
          current-page={this.pagination2.currentPage}
          page-size={this.pagination2.pageSize}
          total={this.pagination2.total}
          on-current-change={this.onCurrentChange}
          on-size-change={this.onSizeChange}
          {...mergeProps(props.pagination, { props: CP.Pagination.props })}
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
    const mergedFormItem = mergeProps(formItem, { props: CP.FormItem.props })

    if (render) {
      // 自定义 FormItem 内组件
      node = args => {
        const key = formTableProp(args.$index, prop)
        return (
          <FormItem prop={key} {...mergedFormItem}>
            {render({ ...args, key })}
          </FormItem>
        )
      }
    } else if (input) {
      node = ({ row, $index }) => (
        <FormItem prop={formTableProp($index, prop)} {...mergedFormItem}>
          <Input
            clearable
            v-model={row[prop]}
            placeholder='请输入'
            {...mergeProps(input, { props: CP.Input.props, attrs: CP.Input.props })}
          />
        </FormItem>
      )
    } else if (select) {
      node = ({ row, $index }) => {
        // const options = typeof opts === 'function' ? opts(args) : opts
        return (
          <FormItem prop={formTableProp($index, prop)} {...mergedFormItem}>
            <Select
              clearable
              v-model={row[prop]}
              placeholder='请选择'
              {...mergeProps(select, { props: CP.Select.props })}
            >
              {/* @ts-ignore */}
              {select.options?.map(option => <Option {...mergeProps(option, { props: CP.Option.props })} />)}
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

  if (column['_click_to_log']) {
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

  return (obj: Parameters<TableColumn['render']>[0]) => {
    let n = ensureNodeValueVNode.call(this, render(obj))
    // @ts-ignore
    n = <Tooltip
      placement={tooltip.props?.placement ?? 'top'}
      content={tooltip.render ? tooltip.render(obj) : obj.row[column.prop]}
      {...mergeProps(tooltip, { props: CP.Tooltip.props })}
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

// https://stackoverflow.com/questions/1027224/how-can-i-test-if-a-letter-in-a-string-is-uppercase-or-lowercase-using-javascrip
function convertLiteral(key: string) {
  // kebab-case -> camelCase
  const camel = key.split('-').map((str, i) => i === 0 ? str : str[0].toUpperCase() + str.slice(1)).join('')

  // camelCase -> kebab-case
  let i = 0
  let kebab = ''
  while (i <= key.length) {
    const character = key.charAt(i)
    if (character && character === character.toUpperCase()) {
      kebab += `-${character.toLowerCase()}`
    } else {
      kebab += character
    }
    i++
  }

  return { camel, kebab }
}

/**
 * 🌱 将 element-ui 属性提升到顶级
 * @see https://zhuanlan.zhihu.com/p/37920151
 * @see https://github.com/vuejs/babel-helper-vue-jsx-merge-props/blob/master/index.js
 * @see https://github.com/vuejs/babel-plugin-transform-vue-jsx/blob/HEAD/lib/group-props.js
 */
function mergeProps<T = any>(target: T, props: Partial<Record<keyof VNodeData, string[]>>) {
  if (!target) return target
  for (const [prop, keys] of Object.entries(props)) {
    if (!target[prop]) target[prop] = {}
    for (const key of keys) {
      const { camel, kebab } = convertLiteral(key)
      const targetPropKeys = Object.keys(target[prop])
      const targetKeys = Object.keys(target)
      if (!targetPropKeys.includes(camel) && !targetPropKeys.includes(kebab)) {
        if (targetKeys.includes(camel)) {
          target[prop][camel] = target[camel]
        } else if (targetKeys.includes(kebab)) {
          target[prop][kebab] = target[kebab]
        }
      }
    }
  }
  return target as any
}

/** Component props */
const CP: Record<string, { props: string[]; on: string[]; }> = {
  Form: {
    props: [
      'model',
      'rules',
      'inline',
      'disabled',
      'labelPosition',
      'labelWidth',
      'showMessage',
      'inlineMessage',
      'statusIcon',
      'validateOnRuleChange',
      'size',
    ],
    on: [
      'validate',
      'validate',
      'validateField',
      'resetFields',
      'clearValidate',
    ]
  },
  FormItem: {
    props: [
      'prop',
      'label',
      'labelWidth',
      'required',
      'rules',
      'error',
      'showMessage',
      'inlineMessage',
      'size',
    ],
    on: [
      'resetField',
      'clearValidate',
    ]
  },
  Input: {
    props: [
      'type',
      'value',
      'maxlength',
      'minlength',
      'placeholder',
      'disabled',
      'size',
      'prefixIcon',
      'suffixIcon',
      'rows',
      'autosize',
      'autoComplete',
      'autocomplete',
      'name',
      'readonly',
      'max',
      'min',
      'step',
      'resize',
      'autofocus',
      'form',
      'validateEvent',
      'clearable',
      'showPassword',
      'showWordLimit',
    ],
    on: [
      'focus',
      'blur',
      'select',
    ],
  },
  Select: {
    props: [
      'value',
      'multiple',
      'disabled',
      'valueKey',
      'size',
      'clearable',
      'multipleLimit',
      'autoComplete',
      'autocomplete',
      'name',
      'placeholder',
      'filterable',
      'allowCreate',
      'filterMethod',
      'remote',
      'remoteMethod',
      'loading',
      'loadingText',
      'noMatchText',
      'noDataText',
      'popperClass',
      'defaultFirstOption',
      'popperAppendToBody',
    ],
    on: [
      'focus',
      'blur',
    ],
  },
  Option: {
    props: [
      'value',
      'label',
      'disabled',
    ],
    on: [],
  },
  DatePicker: {
    props: [
      'value',
      'readonly',
      'disabled',
      'size',
      'editable',
      'clearable',
      'placeholder',
      'startPlaceholder',
      'endPlaceholder',
      'type',
      'format',
      'align',
      'popperClass',
      'pickerOptions',
      'rangeSeparator',
      'defaultValue',
      'valueFormat',
      'name',
    ],
    on: [
      'focus',
    ]
  },
  Table: {
    props: [
      'data',
      'height',
      'maxHeight',
      'stripe',
      'border',
      'fit',
      'showHeader',
      'highlightCurrentRow',
      'currentRowKey',
      'lazy',
      'indent',
      'rowClassName',
      'rowStyle',
      'cellClassName',
      'cellStyle',
      'headerRowClassName',
      'headerRowStyle',
      'headerCellClassName',
      'headerCellStyle',
      'rowKey',
      'emptyText',
      'defaultExpandAll',
      'expandRowKeys',
      'defaultSort',
      'tooltipEffect',
      'showSummary',
      'sumText',
      'summaryMethod',
      'selectOnIndeterminate',
    ],
    on: [
      'clearSelection',
      'toggleRowSelection',
      'toggleAllSelection',
      'setCurrentRow',
      'toggleRowExpansion',
      'clearSort',
      'clearFilter',
      'doLayout',
      'sort',
      'load',
    ],
  },
  TableColumn: {
    props: [
      'type',
      'label',
      'columnKey',
      'prop',
      'width',
      'minWidth',
      'fixed',
      'renderHeader',
      'sortable',
      'sortMethod',
      'sortOrders',
      'resizable',
      'formatter',
      'showOverflowTooltip',
      'align',
      'headerAlign',
      'className',
      'labelClassName',
      'selectable',
      'reserveSelection',
      'filters',
      'filterPlacement',
      'filterMultiple',
      'filterMethod',
      'filteredValue',
    ],
    on: [],
  },
  Pagination: {
    props: [
      'small',
      'pageSize',
      'total',
      'pageCount',
      'pagerCount',
      'currentPage',
      'layout',
      'pageSizes',
      'popperClass',
      'prevText',
      'nextText',
      'hideOnSinglePage',
    ],
    on: [],
  },
  Tooltip: {
    props: [
      'effect',
      'content',
      'placement',
      'value',
      'disabled',
      'offset',
      'transition',
      'visibleArrow',
      'popperOptions',
      'openDelay',
      'manual',
      'popperClass',
      'enterable',
      'hideAfter',
      'tabindex',
    ],
    on: [],
  },
}

// TODO: @vue/composition-api 中返回的是 VueProxy
export default TableElementUI as any
