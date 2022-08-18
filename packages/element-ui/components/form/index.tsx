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
import type { ElSelect } from 'element-ui/types/select'
import type { Component, VNodeData } from 'vue'
import type { OptionRecord, JSX_ELEMENT } from '../types'

export type HBInput = Partial<ElInput> & VNodeData
export type HBSelect = Partial<ElSelect> &
  VNodeData & { options: OptionRecord[] }
export type HBDatePicker = Partial<ElDatePicker> & VNodeData
type CacheType = { filterKey?: string } | boolean

export interface FormElement extends Partial<ElFormItem> {
  render?: () => JSX_ELEMENT
  input?: HBInput
  select?: HBSelect
  datePicker?: HBDatePicker
  col?: ElCol
}
export interface FormProps {
  elements: (FormElement | (() => JSX_ELEMENT))[]
  onSubmit?: () => Promise<void | boolean> | void | boolean
  onReset?: () => void
  handle?: ElForm
  cache?: CacheType
  footer?: false | JSX_ELEMENT
  props: Partial<ElForm>
  row?: ElRow,
  col?: ElCol,
}

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

const FormElementUI: Component<
  () => {
    originFormModel: Record<PropertyKey, any>,
    filterKey: string,
  },
  {
    getParams: () => Record<PropertyKey, any>,
    cachesParams: () => void,
    onFormSubmit: () => void,
    onFormReset: () => void,
  },
  Record<PropertyKey, any>,
  FormProps
> = {
  name: 'hb-ui-form',
  data() {
    const { props, cache } = this.$props;

    return {
      originFormModel: { ...props.model },
      filterKey: cache.filterKey || 'filterData',
    }
  },
  props: {
    props: {
      // @ts-ignore
      type: Object as { (): ElForm },
      default: () => ({}),
    },
    elements: {
      // @ts-ignore
      type: Array,
      default: () => [],
    },
    // @ts-ignore
    onSubmit: Function,
    onReset: Function,
    handle: {
      // @ts-ignore
      type: Object as { (): FormProps['handle'] },
      default: () => ({}),
    },
    cache: {
      // @ts-ignore
      type: [Object as { (): CacheType }, Boolean],
      default: false,
    },
    footer: false,
  },
  mounted() {
    const { handle, cache, props } = this.$props
    if (handle) Object.assign(handle, this.$refs['hb-ui-form'])
    if (cache) {
      const params = this.getParams()
      if (params[this.filterKey]) {
        for (const [k, v] of Object.entries(JSON.parse(params[this.filterKey]))) {
          this.$set(props.model, k, v)
        }
      }
    }
  },
  methods: {
    getParams() {
      const dict = {}
      const query = new URLSearchParams(location.search.slice(1))
      for (const [k, v] of query) dict[k] = v
      return dict
    },
    cachesParams() {
      const { model } = this.$props.props
      const dict = {}
      for (const [k, v] of Object.entries(model)) {
        if (v) dict[k] = v
      }
      const params = this.getParams()
      const { [this.filterKey]: temp, ...rest } = params
      const queryString = new URLSearchParams({
        ...rest,
        ...(Object.keys(dict).length > 0
          ? { [this.filterKey]: JSON.stringify(dict) }
          : undefined),
      }).toString()
      window.history.replaceState(
        {},
        '',
        `/${location.hash.split('?')[0]}${queryString ? '?' : ''}${queryString}`
      )
    },
    async onFormSubmit() {
      const { onSubmit, cache } = this.$props
      if (onSubmit) {
        const explicitlyStop = await onSubmit()
        if (explicitlyStop === false) return
      }
      if (cache) this.cachesParams()
    },
    onFormReset() {
      const {
        onReset,
        cache,
        props: { model },
      } = this.$props
      for (const k of Object.keys(model)) {
        model[k] = this.originFormModel[k]
      }
      if (onReset) onReset()
      if (cache) this.cachesParams()
    },
  },

  render() {
    const { props, elements, footer, row, col = { xs: 12, sm: 12, md: 8, lg: 8, xl: 3, } } = this.$props as FormProps

    const renderElement = (element: FormElement) => {
      const { prop, render, input = {}, select, datePicker } = element
      const ComponentsMap = {
        input: ({ on, attrs, ...omit }: HBInput) => (
          <Input
            v-model={props.model[prop]}
            // Todo scopedSlots 不生效
            {...{
              props: { clearable: true, ...omit },
              on,
              attrs: {
                placeholder: '请输入',
                maxlength: omit?.maxlength,
                ...attrs,
              },
            }}
          />
        ),
        select: ({ options, on, attrs, ...omit }: HBSelect) => (
          <Select
            v-model={props.model[prop]}
            {...{
              props: { clearable: true, filterable: true, ...omit },
              on,
              attrs: { placeholder: '请选择', ...attrs },
            }}
          >
            {options.map((selectOptOmit) => (
              <Option {...{ props: selectOptOmit }} />
            ))}
          </Select>
        ),
        datePicker: ({
          startPlaceholder = '开始日期',
          endPlaceholder = '结束日期',
          on,
          attrs,
          ...omit
        }: HBDatePicker) => (
          <DatePicker
            v-model={props.model[prop]}
            {...{
              props: { startPlaceholder, endPlaceholder, ...omit },
              on,
              attrs,
            }}
          />
        ),
      }

      if (typeof render === 'function') {
        return render;
      } else if (select) {
        return ComponentsMap['select'](mergeEvents<HBSelect>(select))
      } else if (datePicker) {
        return ComponentsMap['datePicker'](mergeEvents<HBDatePicker>(datePicker))
      } else {
        return ComponentsMap['input'](mergeEvents<HBInput>(input))
      }
    }

    return (
      // @ts-ignore
      <Form ref='hb-ui-form' {...{ props: { inline: true, ...props } }}>
        <Row {...{ props: row }}>
          {elements.map((element) => typeof element === 'function' ? element() : (
            <Col {...{ props: element.col || col }}>
              <FormItem {...{ props: element }}
              // Todo scopedSlots 生效但失去双向绑定
              >
                {renderElement(element)}
              </FormItem>
            </Col>
          ))}
        </Row>
        {footer ?? (
          <span>
            {/* @ts-ignore */}
            <Button type='primary' onClick={this.onFormSubmit}>查询</Button>
            {/* @ts-ignore */}
            <Button onClick={this.onFormReset}>重置</Button>
          </span>
        )}
      </Form>
    )
  },
}

export default FormElementUI as any
