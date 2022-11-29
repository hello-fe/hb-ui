import React, { useEffect } from 'react'
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

// ## 设计原则
// 1. Form.Item 应该使用 render props(小) 代替 children

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
      render?: (value: any, form: FormInstance<Values>) => React.ReactNode
    })
    // render function(大)
    | ((index: number, form: FormInstance<Values>) => React.ReactNode)
  )[]
  /** 预留给 [提交/重置] 的位置 */
  lastItem?:
  | (AntdFormItemProps & {
    col?: ColProps
    // render props(小)
    render?: (nodes: React.ReactNode[], form: FormInstance<Values>) => React.ReactNode
  })
  // render function(大)
  | ((nodes: React.ReactNode[], form: FormInstance<Values>) => React.ReactNode)
  onSubmit?: (values: Values, form: FormInstance<Values>) => void
  onFormReset?: (values: Values, form: FormInstance<Values>) => void
  /** 表单条件缓存 */
  cache?: {
    /** @default "form-data" */
    key?: string,
    /** 外部控制回填参数，返回 undefined | null 会丢弃缓存 */
    format?: (params: Record<string, any>) => typeof params | void
  }
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
    onFormReset,
    form: propsForm,
    className,
    cache = {},
    row,
    col = colDefault,
    ...restFormProps
  } = props
  const [form] = Form.useForm<Values>(propsForm)
  const cacheKey = cache.key ?? 'form-data'

  const clickSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (onSubmit) {
        onSubmit(values, form)
        // TODO: onSubmit 返回 false 显示的打断缓存，适用 Form 外的校验场景
        cache && cacheParams(cacheKey, values as Record<string, any>)
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const clickReset = async () => {
    try {
      form.resetFields()
      const values = await form.validateFields()
      if (onFormReset) {
        // 和原生 onReset 名字冲突改为 onFormReset
        onFormReset(values, form)
        cache && cacheParams(cacheKey, values as Record<string, any>)
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const renderLastItem = () => {
    const lastItemNodes = [
      <Button key='last-1' type='primary' onClick={clickSubmit}>提交</Button>,
      <Button key='last-2' style={{ marginLeft: 10 }} onClick={clickReset}>重置</Button>,
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

  useEffect(() => {
    formateStyle()

    if (cache) {
      let params = getUrlParamsString() ? JSONparse(getUrlParamsString.asJSON()[cacheKey]) : null
      if (params && Object.keys(params).length) {
        if (cache.format) {
          params = cache.format(params)
        }
        if (params == null) {
          form.resetFields() // 返回 null | undefined 清空表单
        } else {
          form.setFieldsValue(params)
        }
      }
    }
  }, [])

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
): React.ReactNode {
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

  let node: React.ReactNode
  const defaultNode = (
    <Input allowClear placeholder={`请输入${item.label || ''}`} {...input} />
  )

  if (render) {
    node = render(form.getFieldValue(item.name!), form)
  } else if (input) {
    node = defaultNode
  } else if (select) {
    node = (
      <Select
        allowClear
        showSearch
        placeholder={`请选择${item.label || ''}`}
        filterOption={(input, option) => {
          const reg = new RegExp(input)
          const res = (option?.label && reg.exec(option.label as string)) ||
            (option?.value && reg.exec(option.value as string))
          return !!res
        }}
        {...select}
      />
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

FormAntd.useForm = Form.useForm
FormAntd.useUrlParams = (): [Record<string, string>, string] => [getUrlParamsString.asJSON(), getUrlParamsString()]

export default FormAntd

function JSONparse(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn(error)
    return null
  }
}

// 获取参数
function getUrlParamsString() {
  // e.g.
  //   http://www.foo.com/index.html?abc=123/#/hash - ?在前
  //   http://www.foo.com/index.html/#/hash?abc=123 - #在前
  return location.href.split('?')[1]?.split('#')[0]?.replace('/', '');
}
getUrlParamsString.asJSON = function () {
  return Object.fromEntries(new URLSearchParams(getUrlParamsString()))
}

// 设置缓存
function cacheParams(key: string, data: Record<string, any>) {
  const dict: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) && !v.length) continue
    if (v === '' || v == null) continue
    // 只保留有效条件
    dict[k] = v
  }
  const params = getUrlParamsString.asJSON()
  const { [key]: /* 剔除旧缓存 */_, ...rest } = params
  const querystring = new URLSearchParams({
    // 合并原有的 querystring
    ...rest,
    ...(Object.keys(dict).length > 0
      ? { [key]: JSON.stringify(dict) }
      : undefined),
  }).toString()
  const oldQuerystring = getUrlParamsString()

  // 取出 url 路径部分
  let urlPath = location.href.replace(location.origin, '')
  if (querystring && oldQuerystring) {
    urlPath = urlPath.replace(oldQuerystring, querystring)
  } else if (querystring) {
    urlPath = `${urlPath}?${querystring}`
  } else if (oldQuerystring) {
    // 重置表单，清空缓存
    urlPath = urlPath.replace(`?${oldQuerystring}`, '')
  }

  history.replaceState({/* 透传至 popstate 事件 event.state */ }, 'title', urlPath)
}
