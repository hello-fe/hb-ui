import React from 'react'
import { Input } from 'antd'
import {
  Form,
  FormProps,
} from 'root/components'

export default () => {

  const onSubmit: FormProps['onSubmit'] = (values, form) => {
    console.log(values, form)
  }

  const onFormReset: FormProps['onFormReset'] = (values, form) => {
    console.log(values)
  }

  const formProps: FormProps = {
    onSubmit,
    onFormReset,
    cache: {
      format(params) {
        delete params.date // 去掉时间字段(需要 moment 格式化)
        return params
      },
    },
    collapse: {
      index: 4,
    },
    initialValues: { name: '阿宁' },
    items: [
      {
        label: '姓名',
        name: 'name',
        rules: [{ required: true, message: '请输入姓名！' }],
        render: () => <Input placeholder='请输入姓名' />
      },
      {
        label: '岗位',
        name: 'department',
        select: {
          options: [
            {
              label: '前端',
              value: 'front-end'
            },
            {
              label: '产品',
              value: 'product'
            },
          ],
        },
      },
      {
        label: '时间',
        name: 'date',
        rangePicker: {},
      },
      {
        label: '性别',
        name: 'gender',
        radioGroup: {
          options: [
            {
              label: '男',
              value: 1,
            },
            {
              label: '女',
              value: 0,
            },
          ],
        },
      },
      {
        label: '状态',
        name: 'status',
        switch: {
          checkedChildren: '在职',
          unCheckedChildren: '离职',
          // Warning: [antd: Switch] `value` is not a valid prop, do you mean `checked`?
          checked: undefined,
        },
      }
    ],
  }

  return (
    <div>
      <Form {...formProps} />
    </div>
  )
}
