import {
  Form,
  FormItem,
  Input,
  Select,
  Option,
  Button,
  DatePicker,
  Row,
  Col,
} from 'element-ui'
import type { ElCol } from 'element-ui/types/col'
import type { ElRow } from 'element-ui/types/row'
import type { ElDatePicker } from 'element-ui/types/date-picker'
import type { ElForm } from 'element-ui/types/form'
import type { ElFormItem } from 'element-ui/types/form-item'
import type { ElInput } from 'element-ui/types/input'
import type { ElOption } from 'element-ui/types/option'
import type { ElSelect } from 'element-ui/types/select'
import type { Component, VNodeData } from 'vue'
import type { OptionRecord, JSX_ELEMENT } from '../types'

// ## 设计原则
// 1. jsx 属性最终兼容 import('vue').VNodeData

// ## 属性分类
// 1. 组件属性             - 写在顶级
// 2. element-ui 属性     - 写在顶级
// 3. element-ui 事件     - 写在 on
// 4. html、vue 属性、事件 - 写在标签

export interface FormProps extends Partial<ElForm>, VNodeData {
  items: (
    | (Partial<ElFormItem> & VNodeData & {
      input?: Partial<ElInput> & VNodeData
      select?: Partial<ElSelect> & VNodeData & { options: (OptionRecord & Partial<ElOption>)[] }
      datePicker?: Partial<ElDatePicker> & VNodeData
      render?: (value: any, handle: ElForm) => JSX_ELEMENT
      col?: Partial<ElCol>
    })
    // render function(大)
    | ((index: number, handle: ElForm) => JSX_ELEMENT)
  )[]
  /** 预留给 [提交/重置] 的位置 */
  lastItem?: // 如果需要 label 宽度对齐，传递 label=' ' 后 labelWidth 生效
  | (Partial<ElFormItem> & {
    col?: Partial<ElCol>
    render?: (nodes: import('vue').VNode[], handle: ElForm) => JSX_ELEMENT // render props(小)
  })
  | ((nodes: import('vue').VNode[], handle: ElForm) => JSX_ELEMENT) // render function(大)
  onSubmit?: (values: Record<PropertyKey, any>, handle: ElForm) => Promise<void | false> | void | false
  onReset?: () => void
  handle?: ElForm
  cache?: false | { key?: string }
  row?: Partial<ElRow>
  col?: Partial<ElCol>
}

export type FormItemProps = FormProps['items'][number]

const name = 'hb-ui-form'
const FormItemUI: Component<
  () => {
    originalModel: Record<PropertyKey, any>,
  },
  {
    onFormSubmit: () => void,
    onFormReset: () => void,
  },
  Record<PropertyKey, any>,
  { $props: FormProps }
> = {
  name,
  data() {
    const props = this.$props as FormProps

    // props 默认内部提供 model
    if (!props.model) props.model = {}

    return {
      originalModel: { ...props.model },
    }
  },
  computed: {
    cacheKey() {
      const props = this.$props as FormProps
      if (props.cache === false) {
        return ''
      }
      return props.cache?.key ?? 'form-data'
    },
  },
  props: {
    $props: {
      // @ts-ignore
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    const props = this.$props as FormProps

    // handle 挂载
    if (props.handle) props.handle = this.$refs[name]

    // 还原缓存
    if (this.cacheKey) {
      const params = getParams()
      if (params[this.cacheKey]) {
        for (const [k, v] of Object.entries(JSON.parse(params[this.cacheKey]))) {
          this.$set(props.model, k, v)
        }
      }
    }
  },
  methods: {
    async onFormSubmit() {
      const props = this.$props as FormProps
      if (props.onSubmit) {
        const needCacheParams = await props.onSubmit(props.model, this.$refs[name])
        // 阻止缓存 🤔
        if (needCacheParams === false) return
      }
      if (this.cacheKey) cacheParams(this.cacheKey, props.model)
    },
    onFormReset() {
      const props = this.$props as FormProps
      for (const k of Object.keys(props.model)) {
        props.model[k] = this.originalModel[k]
      }
      if (props.onReset) props.onReset()
      if (this.cacheKey) cacheParams(this.cacheKey, props.model)
    },
  },

  render() {
    const _this = Object.assign(this, { $createElement: arguments[0] })
    const props = this.$props as FormProps
    const {
      items = [],
      lastItem,
      row,
      col = { xs: 12, sm: 12, md: 8, lg: 8, xl: 3 },
      // extra
      // onSubmit: _1,
      // onReset: _2,
      // handle: _3,
      // cache: _4,
      // on: _5,
    } = props

    const renderLastItem = (lastItem: FormProps['lastItem']) => {
      const nodes = [
        // @ts-ignore
        <Button key="last-1" type='primary' onClick={this.onFormSubmit}>查询</Button>,
        // @ts-ignore
        <Button key="last-2" onClick={this.onFormReset}>重置</Button>,
      ]
      if (typeof lastItem === 'function') {
        return lastItem(nodes, this.$refs[name])
      }
      return (
        <Col {...{ props: lastItem?.col || col }}>
          <FormItem {...{ props: lastItem, attrs: lastItem }}>
            {lastItem?.render ? lastItem.render(nodes, this.$refs[name]) : nodes}
          </FormItem>
        </Col>
      )
    }

    return (
      // @ts-ignore
      <Form ref={name} {...mergeProps(props)}>
        <Row {...{ props, row }}>
          {items.map((item, index) => typeof item === 'function' ? item(index, this.$refs[name]) : (
            <Col {...{ props: item.col || col }}>
              {renderFormItem.call(_this, this.$refs[name], item, index)}
            </Col>
          ))}
          {renderLastItem(lastItem)}
        </Row>
      </Form>
    )
  },
}

function renderFormItem(
  handle: ElForm,
  item: FormItemProps,
  index: number,
) {
  // 编译后的 jsx 需要使用 h 函数
  const h = this.$createElement
  const props = this.$props as FormProps

  // never used, for ts check
  if (typeof item === 'function') return item(index, handle)

  const {
    render,
    input,
    select,
    datePicker
  } = item

  let node: JSX_ELEMENT | (() => JSX_ELEMENT)
  const defaultNode = () => {
    const { placeholder = `请输入${item.label || ''}` } = input || {}
    // @ts-ignore
    return <Input v-model={props.model[item.prop]} placeholder={placeholder} clearable {...mergeProps(input)} />
  }

  if (render) {
    node = render(props.model[item.props.prop], handle)
  } else if (input) {
    node = defaultNode
  } else if (select) {
    const { placeholder = `请选择${item.label || ''}`, options } = select
    node = (
      // @ts-ignore
      <Select v-model={props.model[item.prop]} placeholder={placeholder} clearable {...mergeProps(select)}>
        {options.map(option => <Option {...mergeProps(option)} />)}
      </Select>
    )
  } else if (datePicker) {
    // @ts-ignore
    node = <DatePicker v-model={props.model[item.prop]} startPlaceholder='开始日期' endPlaceholder='结束日期' clearable {...mergeProps(datePicker)} />
  } else {
    node = defaultNode
  }

  return (
    // Todo scopedSlots 生效但失去双向绑定
    <FormItem {...mergeProps(item)}>
      {node}
    </FormItem>
  )
}

// 将顶级属性事件合并到 on 中
function mergeEvents<T extends { on?: Record<PropertyKey, any> }>({ on, ...rest }: T) {
  return {
    ...rest,
    on: {
      ...on,
      ...Object.entries(rest)
        .map(([k, v]) => {
          if (k.startsWith('on') && k !== 'on')
            return { [k.slice(2).toLowerCase()]: v }
        })
        .reduce((a, b) => ({ ...a, ...b }), {}),
    },
  }
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

// 获取缓存
function getParams() {
  return Object.fromEntries(new URLSearchParams(location.search.slice(1)))
}

// 设置缓存
function cacheParams(key: string, data: Record<PropertyKey, any>) {
  const dict = {}
  for (const [k, v] of Object.entries(data)) {
    // 只保留有效条件
    if (v) dict[k] = v
  }
  const params = getParams()
  const { [key]: temp, ...rest } = params
  const queryString = new URLSearchParams({
    ...rest,
    ...(Object.keys(dict).length > 0
      ? { [key]: JSON.stringify(dict) }
      : undefined),
  }).toString()
  window.history.replaceState(
    {},
    '',
    `/${location.hash.split('?')[0]}${queryString ? '?' : ''}${queryString}`
  )
}

export default FormItemUI as any
