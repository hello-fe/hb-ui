import React, { useState } from 'react'
import { Button, Space, Tooltip } from 'antd'
import {
  Table,
  TableProps,
  TableHandle,
} from 'root/components'

export interface RecordType {
  id: string
  name: string
  age: number
  gender: 0 | 1
  date: number
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
    for (const form of handle.forms) {
      // 🐞 Not work!
      // form.resetFields()
    }
    // hark
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
      {
        title: '性别',
        dataIndex: 'gender',
        // render: gender => gender === 1 ? '男' : '女',
        formItem: {
          select: {
            options: [
              { label: '男', value: 1 },
              { label: '女', value: 0 },
            ],
          },
          rules: [{ required: true, message: '请选择性别！' }],
        },
        width: 140,
      },
      {
        title: '时间',
        dataIndex: 'date',
        render: date => new Date(date).toLocaleString(),
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
