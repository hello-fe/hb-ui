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
import { Component } from 'vue'

export type HBEvent = {
  onChange?: (data: number | string | Date | Date[]) => void
  onInput?: (data: number | string) => void
}
export type HBInput = Partial<ElInput> & HBEvent
export type HBSelect = Partial<ElSelect & { props: Partial<ElSelect> }> & {
  options: OptionRecord[]
} & HBEvent
export type HBDatePicker = Partial<ElDatePicker> & HBEvent
export interface FormElement extends Partial<ElFormItem> {
  label: string
  name: string
  labelWidth?: string
  render?: () => JSX.Element
  input?: HBInput
  select?: HBSelect
  datePicker?: HBDatePicker
}
export interface FormProps {
  model: KVA
  labelWidth: string
  elements: (FormElement | (() => JSX.Element))[]
  onSubmit?: () => Promise<void | Boolean> | void | Boolean
  onReset?: () => void
  handle: ElForm
  paramsCache?: boolean
  footer?: false | JSX.Element
}

const filterKey = 'filterData'

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
    paramsCache: {
      type: Boolean,
      default: false,
    },
    footer: false,
  },
  mounted() {
    const { handle, paramsCache, model } = this.$props
    if (handle) {
      Object.assign(handle, this.$refs['hb-ui-form'])
    }
    console.log(this.$props)
    if (paramsCache) {
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
        if (v) {
          dict[k] = v
        }
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
      const { onSubmit, paramsCache } = this.$props
      if (onSubmit) {
        const explicitlyStop = await onSubmit()
        if (explicitlyStop === false) {
          return
        }
        if (paramsCache) this.cachesParams()
      }
    },
    onFormReset() {
      const { model, onReset, paramsCache } = this.$props
      for (const k of Object.keys(model)) {
        model[k] = this.originFormModel[k]
      }
      if (onReset) {
        onReset()
        if (paramsCache) this.cachesParams()
      }
    },
  },

  render() {
    const props = this.$props as FormProps

    const renderElement = (element: FormElement) => {
      const { name, render, input = {}, select, datePicker } = element

      const ComponentsMap = {
        input: ({ onChange, onInput, ...omit }: HBInput) => (
          <Input
            v-model={props.model[name]}
            placeholder='请输入'
            clearable
            onChange={onChange || Function}
            onInput={onInput || Function}
            {...{ props: { ...omit } }}
            maxlength={omit?.maxlength}
          />
        ),
        select: ({ onChange, options, ...omit }: HBSelect) => {
          return (
            <Select
              v-model={props.model[name]}
              placeholder='请选择'
              clearable
              filterable
              onChange={onChange || Function}
              {...{ props: { ...omit } }}
            >
              {options.map(({ label, value, ...selectOptOmit }, idx) => (
                <Option
                  key={idx}
                  label={label}
                  value={value}
                  {...{ props: selectOptOmit }}
                />
              ))}
            </Select>
          )
        },
        datePicker: ({
          startPlaceholder = '开始日期',
          endPlaceholder = '结束日期',
          onChange,
          ...omit
        }: HBDatePicker) => (
          <DatePicker
            v-model={props.model[name]}
            startPlaceholder={startPlaceholder}
            endPlaceholder={endPlaceholder}
            onChange={onChange || Function}
            {...{ props: { ...omit } }}
          />
        ),
        render,
      }

      if (typeof render === 'function') {
        return ComponentsMap['render']
      }
      if (typeof select === 'object') {
        return ComponentsMap['select'](select)
      }
      if (typeof datePicker === 'object') {
        return ComponentsMap['datePicker'](datePicker)
      }
      return ComponentsMap['input'](input)
    }

    return (
      <div>
        <ElementForm
          ref='hb-ui-form'
          v-model={props.model}
          label-width={props.labelWidth}
          {...{ props: { inline: true, ...props } }}
        >
          {props.elements.map((element, idx) => {
            if (typeof element === 'function') return element()
            const {
              name,
              label,
              rules,
              labelWidth: itemLabelWidth,
              $scopedSlots,
              ...itemOmit
            } = element
            console.log(itemOmit)
            return (
              <ElementFormItem
                key={idx}
                label={label}
                prop={name}
                rules={rules}
                labelWidth={itemLabelWidth ?? props.labelWidth}
                {...{ props: { ...itemOmit } }}
                scopedSlots={$scopedSlots}
              >
                {renderElement(element)}
              </ElementFormItem>
            )
          })}
          {props.footer ?? (
            <span>
              <Button type='primary' onClick={this.onFormSubmit}>
                查询
              </Button>
              <Button onClick={this.onFormReset}>重置</Button>
            </span>
          )}
        </ElementForm>
      </div>
    )
  },
}

export default FormElementUI as any
