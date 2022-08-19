import React from 'react'
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

export interface FormProps<Values = Record<string, any>> extends AntdFormProps<Values> {
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
      render?: () => JSX.Element
    })
    // render function(大)
    | (() => JSX.Element)
  )[]
  /** 预留给 [提交/重置] 的位置 */
  lastItem?:
  | (AntdFormItemProps & { col?: ColProps /* TODO: render props(小) */ })
  | ((form: FormInstance<Values>) => JSX.Element) // render function(大)
  onSubmit?: (values: Values, form: FormInstance<Values>) => void
  row?: RowProps
  col?: ColProps
}

export type FormItemProps<Values = Record<string, any>> = FormProps<Values>['items'][number]

function FormAntd<Values = Record<PropertyKey, any>>(props: FormProps<Values>) {

  const colDefault: ColProps = {
    sm: 24,
    md: 12,
    lg: 8,
    xl: 6,
    xxl: 3
  }

  const {
    items,
    lastItem,
    onSubmit,
    onReset,
    // 🤔 如果外部需要 FormInstance 可以从外部传递进来
    // 默认值使用不当可能会掉进 hooks 陷阱！
    form = Form.useForm<Values>()[0],
    className,
    row,
    col = colDefault, // TODO
    ...restFormProps
  } = props

  const clickSubmit = async () => {
    try {
      const values = await form.validateFields()
      onSubmit?.(values, form)
    } catch (error) {
      console.warn(error)
    }
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
        {items.map((item, index, arr) => typeof item === 'function'
          ? item()
          : <Col {...(item.col || col)} key={index}>{renderFormItem(item, index, arr)}</Col>
        )}
        {typeof lastItem === 'function' ? lastItem(form) : (
          <Col {...(lastItem?.col || col)}>
            <Form.Item
              key='last-item'
              label=' '
              {...lastItem}
            >
              <Button type='primary' onClick={clickSubmit}>提交</Button>
              <Button style={{ marginLeft: 10 }} onClick={() => form.resetFields()}>重置</Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  )
}

function renderFormItem<Values = Record<string, any>>(
  item: FormItemProps<Values>,
  index: number,
  items: FormItemProps<Values>[],
): JSX.Element {
  // never used, for ts check
  if (typeof item === 'function') return item()

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
    <Input placeholder={`请输入${item.label || ''}`} {...input} />
  )
  
  if (render) {
    node = render()
  } else if (input) {
    node = defaultNode
  } else if (select) {
    node = (
      <Select placeholder={`请选择${item.label || ''}`} {...select} />
    )
  } else if (datePicker) {
    node = (
      <DatePicker {...datePicker} />
    )
  } else if (rangePicker) {
    node = (
      <DatePicker.RangePicker {...rangePicker} />
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
