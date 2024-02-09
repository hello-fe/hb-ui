import React, { useState } from 'react'
import { Button, Col, Row, Space, Tooltip, message } from 'antd'
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
    { id: '3', name: '阿波', age: 25, gender: 1, date: Date.now() },
    { id: '4', name: '菜菜', age: 26, gender: 1, date: Date.now() },
    { id: '5', name: '东哥', age: 27, gender: 0, date: Date.now() },
    { id: '6', name: '老李', age: 28, gender: 0, date: Date.now() },
  ])
  const [open, setOpen] = useState(true)

  const handle = {} as TableHandle<RecordType>

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
    rowSelection: open ? { disabled:(row) => ["2","5"].includes(row.id) } : undefined,
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
    rowKey: (row) => row.id,
  }

  return (
    <>
      <Row> 
        <Col span={6}><Button onClick={()=> setOpen(prev=>!prev)} type="primary">toogle selections</Button></Col>
      </Row>
      <Row gutter={[12,12]}> 
        <Col><Button onClick={()=> message.success(handle?.selection?.allSelected ? "true" : "false")}>allSelected?</Button></Col>
        <Col><Button onClick={()=> message.success(`${JSON.stringify(handle?.selection?.selectedRows)}`)}>selectedRows?</Button></Col>
        <Col><Button onClick={()=> message.success(`${JSON.stringify(handle?.selection?.selectedRowKeys)}`)}>selectedRowKeys?</Button></Col>
        <Col><Button onClick={()=> message.success(`${JSON.stringify(handle?.selection?.isSelected(handle.data[3]))}`)}>菜菜 isSelected?</Button></Col>

      </Row>
      <Row gutter={[12,12]}> 
        <Col><Button onClick={()=>handle?.selection?.select(handle.data[5])}>select 老李</Button></Col>
        <Col><Button onClick={()=>handle?.selection?.toggle(handle.data[3])}>toggle 菜菜</Button></Col>
        <Col><Button onClick={()=>handle?.selection?.unSelect(handle.data[3])}>unSelect 菜菜</Button></Col>
        <Col><Button onClick={()=>handle?.selection?.toggleAll()}>toggleAll</Button></Col>
        <Col><Button onClick={()=>handle?.selection?.selectAll()}>selectAll</Button></Col>
        <Col><Button onClick={()=>handle?.selection?.unSelectAll()}>unSelectAll</Button></Col>
        <Col><Button onClick={()=>handle?.selection?.setSelected([handle.data[0].id])}>setPartSelected</Button></Col>
      </Row>
      <Table {...tableProps} />
    </>
  )
}
