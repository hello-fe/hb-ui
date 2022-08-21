import type { Component, VNodeData } from 'vue'
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

export interface FormProps extends VNodeData {
  /** @override */
  props?: Partial<ElForm>,
  items: (
    | (VNodeData & Partial<Pick<ElFormItem, 'label' | 'prop'>> & {
      /** @override */
      props?: Partial<ElFormItem>,
      input?: VNodeData & {
        /** @override */
        attrs?: Partial<ElInput>
      }
      select?: VNodeData & {
        /** @override */
        props?: Partial<ElSelect>
        options: (OptionRecord & Partial<ElOption>)[]
      }
      datePicker?: VNodeData & {
        /** @override */
        props?: Partial<ElDatePicker>
      }
      render?: (value: any, handle: ElForm) => JSX_ELEMENT
      col?: Partial<ElCol>
    })
    // render function(大)
    | ((index: number, handle: ElForm) => JSX_ELEMENT)
  )[]
  /** 预留给 [提交/重置] 的位置 */
  lastItem?: // 如果需要 label 宽度对齐，传递 label=' ' 后 labelWidth 生效
  | (VNodeData & {
    /** @override */
    props?: Partial<ElFormItem>,
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

    if (!props.props) props.props = {}
    // props 默认内部提供 model
    if (!props.props.model) props.props.model = {}

    return {
      originalModel: { ...props.props.model },
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
          this.$set(props.props.model, k, v)
        }
      }
    }
  },
  methods: {
    async onFormSubmit() {
      const props = this.$props as FormProps
      if (props.onSubmit) {
        const needCacheParams = await props.onSubmit(props.props.model, this.$refs[name])
        // 阻止缓存 🤔
        if (needCacheParams === false) return
      }
      if (this.cacheKey) cacheParams(this.cacheKey, props.props.model)
    },
    onFormReset() {
      const props = this.$props as FormProps
      for (const k of Object.keys(props.props.model)) {
        props.props.model[k] = this.originalModel[k]
      }
      if (props.onReset) props.onReset()
      if (this.cacheKey) cacheParams(this.cacheKey, props.props.model)
    },
  },

  render() {
    const _this = Object.assign(this, { $createElement: arguments[0] })
    const props = this.$props as FormProps
    const {
      items,
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
          <FormItem {...mergeProps(lastItem, { props: CP.FormItem.props })}>
            {lastItem?.render ? lastItem.render(nodes, this.$refs[name]) : nodes}
          </FormItem>
        </Col>
      )
    }

    return (
      <Form
        // @ts-ignore
        ref={name}
        // Form 使用 mergeProps 会报错
        // [Vue warn]: Invalid handler for event "input": got undefined
        {...{ props: Object.assign(props.props, { inline: props.props.inline ?? true }), on: props.on }}
      >
        <Row {...mergeProps(row, { props: CP.Row.props })}>
          {items?.map((item, index) => typeof item === 'function' ? item(index, this.$refs[name]) : (
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

  // 在 item.props?.prop 前合并
  mergeProps(item, { props: CP.FormItem.props })

  let node: JSX_ELEMENT | (() => JSX_ELEMENT)
  const defaultNode = () => {
    return <Input
      clearable
      v-model={props.props.model[item.props?.prop]}
      placeholder={input?.props?.placeholder ?? `请输入${item.props?.label || ''}`}
      {...mergeProps(input, { props: CP.Input.props, attrs: CP.Input.props })}
    />
  }

  if (render) {
    node = render(props.props.model[item.props?.prop], handle)
  } else if (input) {
    node = defaultNode
  } else if (select) {
    node = (
      <Select
        clearable
        v-model={props.props.model[item.props?.prop]}
        placeholder={select.props?.placeholder ?? `请选择${item.props?.label || ''}`}
        {...mergeProps(select, { props: CP.Select.props })}
      >
        {select.options?.map(option => <Option {...mergeProps(option, { props: CP.Option.props })} />)}
      </Select>
    )
  } else if (datePicker) {
    node = <DatePicker
      clearable
      v-model={props.props.model[item.props?.prop]}
      placeholder='选择时间'
      startPlaceholder='开始日期'
      endPlaceholder='结束日期'
      {...mergeProps(datePicker, { props: CP.DatePicker.props })}
    />
  } else {
    node = defaultNode
  }

  return (
    // Todo scopedSlots 生效但失去双向绑定
    <FormItem {...item as any}>
      {node}
    </FormItem>
  )
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
      if (target[prop][key] === undefined && target[key] !== undefined) {
        target[prop][key] = target[key]
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
  Row: {
    props: [
      'gutter',
      'type',
      'justify',
      'align',
      'tag',
    ],
    on: [],
  },
  Col: {
    props: [
      'span',
      'offset',
      'push',
      'pull',
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      'tag',
    ],
    on: [],
  },
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
