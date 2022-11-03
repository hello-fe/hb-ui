import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Row, Space, Switch, Tooltip } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import {
  Table,
  TableProps,
  TableHandle,
  TableColumn,
} from 'root/components'

export interface RecordType {
  id: string
  name: string
  age: number
  gender: 0 | 1
  date: number
  render_switch?: boolean
  render_input?: string
}

export default () => {

  const [data, setData] = useState<RecordType[]>([
    { id: '1', name: '张三', age: 23, gender: 1, date: Date.now() },
    { id: '2', name: '阿宁', age: 24, gender: 0, date: Date.now() },
  ])
  const handle = {} as TableHandle<RecordType>

  const clickViewData = () => {
    console.log(handle.data)
  }

  const resetForm = () => {
    handle.resetForms()
  }

  const reload = () => {
    handle?.query()
  }

  const tableProps: TableProps<RecordType> = {
    async query(args) {
      console.log('-- 发起请求 --', JSON.parse(JSON.stringify(args)))

      return {
        data: data.map(d => ({ ...d, date: Date.now() })),
        total: 100,
        pageSize: args.pagination.pageSize,
        current: args.pagination.current,
      }
    },
    columns: [
      {
        title: '姓名',
        dataIndex: 'name',
        formItem: {
          input: {},
          rules: [{ required: true, message: '请输入姓名！' }],
        },
        width: 270,
      },
      {
        title: '年龄',
        dataIndex: 'age',
        render: age => (
          <Tooltip
            title={<span style={{ color: '#fc6470' }}>芳龄: {age}</span>}
          >{age}</Tooltip>
        ),
      },
      // 条件渲染
      {
        title: '性别(条件渲染)',
        dataIndex: 'gender',
        formItem: {
          input: args => args.index % 2 ? {} : null,
          select: ({ form, record, index }) => {
            // 如果 options 需要与其他字段联动，在 callback Function 中配合 hooks 实现，且 cell 单元隔离
            const [options, setOptions] = useState<DefaultOptionType[]>()
            useEffect(() => {
              if (!options) {
                setOptions([
                  { label: '男', value: 1 },
                  { label: '女', value: 0 },
                ])
              }
            }, [options])
            return index % 2 ? null : { options }
          },
          rules: [{ required: true, message: '请选择性别！' }],
        },
        width: 140,
      },
      // 多表单组件-样式实现
      ...renderFormItem({
        title: '多表单组件-样式实现',
        key1: 'key1',
        key2: 'key2',
      }),
      // 多表单组件-自定义 render
      {
        title: '多表单组件-自定义 render',
        dataIndex: 'formItem-render',
        formItem: {},
        render(text, record, index) {
          return <Row>
            <Form.Item name='render_switch'>
              <Switch onChange={val => {
                // 🚨 同步更新！
                record.render_switch = val
              }} />
            </Form.Item>
            <Form.Item name='render_input'>
              <Input onChange={ev => {
                // 🚨 同步更新！
                record.render_input = ev.target.value
              }} />
            </Form.Item>
          </Row>
        },
      },
      {
        title: '操作',
        dataIndex: '操作',
        render: () => <Button onClick={reload}>刷新</Button>,
      },
    ],
    // 直接传递 data
    // dataSource: data,
    // 关闭分页
    // pagination: false,
    handle,
    rowKey: 'id',
  }

  return (
    <>
      <Space style={{ marginBottom: 10 }}>
        <Button type='primary' onClick={clickViewData}>查看数据</Button>
        <Button type='primary' onClick={resetForm}>重置表单</Button>
      </Space>
      <Table {...tableProps} />
    </>
  )
}

function renderFormItem(args: {
  title: string
  key1: string
  key2: string
  width?: number
}) {
  const {
    title,
    key1,
    key2,
    width = 170,
  } = args
  return [
    {
      title,
      dataIndex: key2,
      width: width + 8 * 2,
      formItem: {
        style: { paddingTop: 40 },
        input: {},
      },
    },
    {
      className: 'p-0 w-0',
      dataIndex: key1,
      width: 0,
      formItem: {
        style: {
          position: 'absolute',
          top: 8,
          right: 'calc(100% + 8px)',
          width,
        },
        select: { options: [{ label: 'foo', value: 'foo' }] },
      },
    },
  ] as TableColumn<RecordType>[]
}
