import {
  Form as ElementForm,
  FormItem as ElementFormItem,
  Input,
  Select,
  Option,
  Button,
  DatePicker,
} from 'element-ui'
import type { ElDatePicker } from 'element-ui/types/date-picker'
import type { ElForm } from 'element-ui/types/form'
import type { ElFormItem } from 'element-ui/types/form-item'
import type { ElInput } from 'element-ui/types/input'
import type { ElSelect } from 'element-ui/types/select'
import type { Component, VNodeData } from 'vue'
import type { OptionRecord, JSX_ELEMENT } from '../../types/common'

export type HBInput = Partial<ElInput> & VNodeData
export type HBSelect = Partial<ElSelect> &
  VNodeData & { options: OptionRecord[] }
export type HBDatePicker = Partial<ElDatePicker> & VNodeData
export interface FormElement extends Partial<ElFormItem> {
  render?: () => JSX_ELEMENT
  input?: HBInput
  select?: HBSelect
  datePicker?: HBDatePicker
}
export interface FormProps {
  elements: (FormElement | (() => JSX_ELEMENT))[]
  onSubmit?: () => Promise<void | boolean> | void | boolean
  onReset?: () => void
  handle?: ElForm
  cache?: boolean
  footer?: false | JSX_ELEMENT
  props: Partial<ElForm>
}

const filterKey = 'filterData'

function convergenceEvent<T extends { on?: KVA }>({ on, ...rest }: T) {
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

const FormElementUI: Component = {
  name: 'hb-ui-form',
  data() {
    return {
      originFormModel: { ...this.$props.props.model },
    }
  },
  props: {
    props: {
      type: Object as { (): ElForm },
      default: () => ({}),
    },
    elements: {
      type: Array,
      default: () => [],
    },
    onSubmit: Function,
    onReset: Function,
    handle: {
      type: Object as { (): FormProps['handle'] },
      default: () => ({}),
    },
    cache: {
      type: Boolean,
      default: false,
    },
    footer: false,
  },
  mounted() {
    const { handle, cache, props } = this.$props
    if (handle) Object.assign(handle, this.$refs['hb-ui-form'])
    if (cache) {
      const params = this.getParams()
      if (params[filterKey]) {
        for (const [k, v] of Object.entries(JSON.parse(params[filterKey]))) {
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
      // delete params[filterKey]
      const { [filterKey]: temp, ...rest } = params
      const queryString = new URLSearchParams({
        ...rest,
        ...(Object.keys(dict).length > 0
          ? { [filterKey]: JSON.stringify(dict) }
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
    const { props, elements, footer } = this.$props as FormProps

    const renderElement = (element: FormElement) => {
      const { prop, render, input = {}, select, datePicker } = element
      const ComponentsMap = {
        input: ({ on, attrs, ...omit }: HBInput) => (
          <Input
            v-model={props.model[prop]}
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
        render,
      }

      if (typeof render === 'function') {
        return ComponentsMap['render']
      }
      if (typeof select === 'object') {
        return ComponentsMap['select'](convergenceEvent<HBSelect>(select))
      }
      if (typeof datePicker === 'object') {
        return ComponentsMap['datePicker'](
          convergenceEvent<HBDatePicker>(datePicker)
        )
      }
      return ComponentsMap['input'](convergenceEvent<HBInput>(input))
    }

    return (
      <ElementForm ref='hb-ui-form' {...{ props: { inline: true, ...props } }}>
        {elements.map((element) => {
          if (typeof element === 'function') return element()
          const { $scopedSlots, ...itemOmit } = element
          return (
            <ElementFormItem
              scopedSlots={$scopedSlots}
              {...{ props: itemOmit }}
            >
              {renderElement(element)}
            </ElementFormItem>
          )
        })}
        {footer ?? (
          <span>
            <Button type='primary' onClick={this.onFormSubmit}>
              查询
            </Button>
            <Button onClick={this.onFormReset}>重置</Button>
          </span>
        )}
      </ElementForm>
    )
  },
}

export default FormElementUI as any
