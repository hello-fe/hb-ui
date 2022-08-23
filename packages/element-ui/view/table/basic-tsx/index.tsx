import { Component } from 'vue'
import { Button } from 'element-ui'
import { Table, TableHandle, TableProps, TableQuery } from 'root/components'

export interface RowType {
  name: string
  age: number
  gender: 0 | 1
  date: number
}

const TableTsx: Component = {
  created() {
    this.tableHandle = {} as TableHandle

    // 主动控制表格数据属性
    // setInterval(() => this.data = this.data.map(d => Object.assign(d, { date: Date.now() })), 1000)
  },
  data() {
    const data: RowType[] = [
      { name: '张三', age: 23, gender: 1, date: Date.now() },
      { name: '阿宁', age: 24, gender: 0, date: Date.now() },
    ]
    const pagination = { currentPage: 1, pageSize: 10, total: 10 }

    return {
      data,
      pagination,
    }
  },
  methods: {
    query: async function query(args) {
      console.log('-- 发起请求 --', JSON.parse(JSON.stringify(args)))

      // 打断请求
      // return

      // 这里写请求
      return {
        data: this.data.map(d => Object.assign(d, { date: Date.now() })),
        ...this.pagination,
      }
    } as TableQuery,
    reload() {
      this.tableHandle.query({ payload: Math.random() })
    },
  },
  render() {
    const tableProps: TableProps<RowType> = {
      data: this.data,
      query: args => this.query(args),
      handle: this.tableHandle,
      columns: [
        { type: 'selection' },
        {
          label: '姓名',
          prop: 'name',
          tooltip: {},
          type: 'default'
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
          label: '时间',
          prop: 'date',
          render: ({ row }) => new Date(row.date).toLocaleString(),
        },
        {
          label: '操作',
          prop: '操作',
          render: () => <Button on-click={this.reload}>刷新</Button>,
        },
      ],
      // 关闭分页
      // pagination: null,
      style: 'color: #fa6470',
      props: {
        border: true,
      },
      // kebab-case
      // 'show-summary': true,
      // camelCase
      // 'showSummary': true,
      on: {
        'selection-change'(rows) {
          console.log('rows:', rows)
        },
      },
    }

    return (
      <div>
        <Table $props={tableProps} />
      </div>
    )
  }
}

export default TableTsx as any
