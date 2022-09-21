import React, { useLayoutEffect } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Radio,
  Switch,
  Button,
  Row,
  Col,
} from 'antd'
import type {
  FormInstance,
  FormProps as AntdFormProps,
  FormItemProps as AntdFormItemProps,
} from 'antd/es/form'
import type { InputProps } from 'antd/es/input'
import type { SelectProps } from 'antd/es/select'
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker'
import type { CheckboxGroupProps } from 'antd/es/checkbox'
import type { RadioGroupProps } from 'antd/es/radio'
import type { SwitchProps } from 'antd/es/switch'
import type { RowProps } from 'antd/es/row'
import type { ColProps } from 'antd/es/col'

/**
 * TODO:
 * 1. 缓存功能
 */

export interface FormProps<Values = Record<PropertyKey, any>> extends AntdFormProps<Values> {
  items: (
    | (AntdFormItemProps & {
      input?: InputProps
      select?: SelectProps
      datePicker?: DatePickerProps
      rangePicker?: RangePickerProps
      checkboxGroup?: CheckboxGroupProps
      radioGroup?: RadioGroupProps
      switch?: SwitchProps
      col?: ColProps

      // render props(小)
      render?: (value: any, form: FormInstance<Values>) => JSX.Element
    })
    // render function(大)
    | ((index: number, form: FormInstance<Values>) => JSX.Element)
  )[]
  /** 预留给 [提交/重置] 的位置 */
  lastItem?:
  | (AntdFormItemProps & {
    col?: ColProps
    // render props(小)
    render?: (nodes: JSX.Element[], form: FormInstance<Values>) => (JSX.Element | JSX.Element[])
  })
  // render function(大)
  | ((nodes: JSX.Element[], form: FormInstance<Values>) => (JSX.Element | JSX.Element[]))
  onSubmit?: (values: Values, form: FormInstance<Values>) => void
  row?: RowProps
  col?: ColProps
}

export type FormItemProps<Values = Record<PropertyKey, any>> = FormProps<Values>['items'][number]

function formateStyle() {
  let id = 'hb-ui-form__style'
  const className = 'hb-ui-form'
  let oStyle = document.getElementById(id) as HTMLStyleElement
  if (oStyle) return

  oStyle = document.createElement<'style'>('style')
  oStyle.id = id
  oStyle.innerHTML = `.${className} .ant-picker { width: 100%; }`
  document.head.appendChild(oStyle)
}

function FormAntd<Values = Record<PropertyKey, any>>(props: FormProps<Values>) {

  useLayoutEffect(() => {
    formateStyle()
  }, [])

  /** @see https://ant.design/components/grid/#Col */
  const colDefault: ColProps = {
    sm: 24 / 1,  // ≥ 576px
    md: 24 / 2,  // ≥ 768px
    lg: 24 / 3,  // ≥ 992px
    xxl: 24 / 4, // ≥ 1600px
  }

  const {
    items,
    lastItem,
    onSubmit,
    onReset,
    form: propsForm,
    className,
    row,
    col = colDefault,
    ...restFormProps
  } = props
  const [form] = Form.useForm<Values>(propsForm)

  const clickSubmit = async () => {
    try {
      const values = await form.validateFields()
      onSubmit?.(values, form)
    } catch (error) {
      console.warn(error)
    }
  }

  const renderLastItem = () => {
    const lastItemNodes = [
      <Button key='last-1' type='primary' onClick={clickSubmit}>提交</Button>,
      <Button key='last-2' style={{ marginLeft: 10 }} onClick={() => form.resetFields()}>重置</Button>,
    ]
    if (typeof lastItem === 'function') return lastItem(lastItemNodes, form)
    const { col: lastCol, render, ...formItemProps } = lastItem || {}

    return (
      <Col {...(lastCol || col)}>
        <Form.Item
          key='last-item'
          label=' '
          {...formItemProps}
        >
          {render ? render(lastItemNodes, form) : lastItemNodes}
        </Form.Item>
      </Col>
    )
  }

  return (
    <Form
      className={['hb-ui-form', className].filter(Boolean).join(' ')}
      form={form}
      colon={false}
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 17 }}
      {...restFormProps}
    >
      <Row {...row}>
        {items.map((item, index) => typeof item === 'function'
          ? item(index, form)
          : <Col {...(item.col || col)} key={index}>{renderFormItem(form, item, index)}</Col>
        )}
        {renderLastItem()}
      </Row>
    </Form>
  )
}

function renderFormItem<Values = Record<PropertyKey, any>>(
  form: FormInstance<Values>,
  item: FormItemProps<Values>,
  index: number,
): JSX.Element {
  // never used, for ts check
  if (typeof item === 'function') return item(index, form)

  const {
    input,
    select,
    datePicker,
    rangePicker,
    checkboxGroup,
    radioGroup,
    switch: switch2,
    render,
    ...restItemProps
  } = item

  let node: JSX.Element
  const defaultNode = (
    <Input allowClear placeholder={`请输入${item.label || ''}`} {...input} />
  )

  if (render) {
    node = render(form.getFieldValue(item.name), form)
  } else if (input) {
    node = defaultNode
  } else if (select) {
    node = (
      <Select allowClear placeholder={`请选择${item.label || ''}`} {...select} />
    )
  } else if (datePicker) {
    node = (
      <DatePicker allowClear {...datePicker} />
    )
  } else if (rangePicker) {
    node = (
      <DatePicker.RangePicker allowClear {...rangePicker} />
    )
  } else if (checkboxGroup) {
    node = (
      <Checkbox.Group {...checkboxGroup} />
    )
  } else if (radioGroup) {
    node = (
      <Radio.Group {...radioGroup} />
    )
  } else if (switch2) {
    node = (
      <Switch {...switch2} />
    )
  } else {
    node = defaultNode
  }

  return (
    <Form.Item
      key={index}
      {...restItemProps}
    >
      {node}
    </Form.Item>
  )
}

export default FormAntd
