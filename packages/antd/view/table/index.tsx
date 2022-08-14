import React, { useState } from 'react'
import { Button, Tooltip } from 'antd'
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
  const handle = {} as TableHandle

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
        render: gender => gender === 1 ? '男' : '女',
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
    <Table {...tableProps} />
  )
}
