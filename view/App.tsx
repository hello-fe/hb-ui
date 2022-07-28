import { Button } from 'element-ui'
import { Component } from 'vue'
import { Table, TableProps } from '../components'

export interface RowRecord {
  name: string
  age: number
  gender: 0 | 1
}

const App: Component = {
  components: {
    [Table.name]: Table,
  },
  data() {
    const data: RowRecord[] = [
      { name: '张三', age: 23, gender: 1 },
      { name: '阿宁', age: 24, gender: 0 },
    ]

    return {
      data,
    }
  },
  render() {
    const tableProps: TableProps<RowRecord> = {
      data: this.data,
      columns: [
        {
          label: '姓名',
          prop: 'name',
          tooltip: {},
        },
        {
          label: '年龄',
          prop: 'age',
          tooltip: {
            render: ({ row }) => <span style='color:#fc6470;'>芳龄: {row.age}</span>,
          },
        },
        {
          label: '性别',
          prop: 'gender',
          render: ({ row }) => row.gender === 1 ? '男' : '女',
        },
        {
          label: '操作',
          prop: '操作',
          render: () => <Button>查看</Button>,
        },
      ],
    }

    return (
      <div>
        {/* <table-element-ui columns={tableProps.columns} /> */}
        <Table {...{ props: tableProps }} />
      </div>
    )
  }
}

export default App
