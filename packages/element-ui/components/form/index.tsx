import {
  Form as ElementForm,
  FormItem as ElementFormItem,
  Input,
  Select,
  Option,
  Button,
  DatePicker,
} from 'element-ui'
import { ElDatePicker } from 'element-ui/types/date-picker'
import { ElForm } from 'element-ui/types/form'
import { ElFormItem } from 'element-ui/types/form-item'
import { ElInput } from 'element-ui/types/input'
import { ElSelect } from 'element-ui/types/select'
import { Component, VNodeData } from 'vue'
import { KVA, OptionRecord, JSX_ELEMENT } from '../../types/common'

export type HBInput = Partial<ElInput> & VNodeData
export type HBSelect = Partial<ElSelect> &
  VNodeData & { options: OptionRecord[] }
export type HBDatePicker = Partial<ElDatePicker> & VNodeData
export interface FormElement extends Partial<ElFormItem> {
  label: string
  name: string
  labelWidth?: string
  render?: () => JSX_ELEMENT
  input?: HBInput
  select?: HBSelect
  datePicker?: HBDatePicker
}
export interface FormProps<FormType = KVA> {
  model: FormType
  labelWidth: string
  elements: (FormElement | (() => JSX_ELEMENT))[]
  onSubmit?: () => Promise<void | boolean> | void | boolean
  onReset?: () => void
  handle?: ElForm
  cache?: boolean
  footer?: false | JSX_ELEMENT
}

const filterKey = 'filterData'

function convergenceEvent<T>(data: T) {
  return {
    ...data,
    on: Object.entries(data)
      .map(([k, v]) => {
        if (k.startsWith('on') && k !== 'on')
          return { [k.slice(2).toLowerCase()]: v }
      })
      .reduce((a, b) => ({ ...a, ...b }), {}),
  }
}

const FormElementUI: Component = {
  name: 'hb-ui-form',
  data() {
    return {
      originFormModel: { ...this.$props.model },
    }
  },
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    labelWidth: {
      type: String,
      default: '80px',
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
    const { handle, cache, model } = this.$props
    if (handle) {
      Object.assign(handle, this.$refs['hb-ui-form'])
    }
    if (cache) {
      const params = this.getParams()
      if (params[filterKey]) {
        for (const [k, v] of Object.entries(JSON.parse(params[filterKey]))) {
          this.$set(model, k, v)
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
      const dict = {}
      for (const [k, v] of Object.entries(this.$props.model)) {
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
        if (cache) this.cachesParams()
      }
    },
    onFormReset() {
      const { model, onReset, cache } = this.$props
      for (const k of Object.keys(model)) {
        model[k] = this.originFormModel[k]
      }
      if (onReset) {
        onReset()
        if (cache) this.cachesParams()
      }
    },
  },

  render() {
    const FP = this.$props as FormProps

    const renderElement = (element: FormElement) => {
      const { name, render, input = {}, select, datePicker } = element
      const ComponentsMap = {
        input: ({ on, attrs, ...omit }: HBInput) => (
          <Input
            v-model={FP.model[name]}
            {...{
              props: {
                clearable: true, 
                ...omit
              },
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
            v-model={FP.model[name]}
            {...{
              props: {  filterable: true, ...omit },
              on,
              attrs: {
                placeholder: '请选择',
                ...attrs
              },
            }}
          >
            {options.map((selectOptOmit, idx) => (
              <Option
                key={idx}
                {...{props: selectOptOmit}}
              />
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
            v-model={FP.model[name]}
            {...{
              props: {
                startPlaceholder,
                endPlaceholder,
                ...omit
              },
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
      <ElementForm
        ref='hb-ui-form'
        v-model={FP.model}
        {...{
          props: {
            inline: true,
            labelWidth: FP.labelWidth,
            ...FP,
          },
        }}
      >
        {FP.elements.map((element, idx) => {
          if (typeof element === 'function') return element()
          const {
            name,
            $scopedSlots,
            ...itemOmit
          } = element

          return (
            <ElementFormItem
              key={idx}
              scopedSlots={$scopedSlots}
              {...{
                props: {
                  prop: name,
                  ...itemOmit,
                },
              }}
            >
              {renderElement(element)}
            </ElementFormItem>
          )
        })}
        {FP.footer ?? (
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
