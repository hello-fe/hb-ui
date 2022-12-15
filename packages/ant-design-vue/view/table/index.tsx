import { computed, defineComponent, ref } from 'vue'
import { Button, Tooltip } from 'ant-design-vue'
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

export default defineComponent({
  setup() {
    const data = ref<RecordType[]>([
      { id: '1', name: '张三', age: 23, gender: 1, date: Date.now() },
      { id: '2', name: '阿宁', age: 24, gender: 0, date: Date.now() },
    ])
    const handle = {} as TableHandle<RecordType>

    const reload = () => {
      handle?.query()
      // data.value = data.value.map(d => ({ ...d, date: Date.now() }))
    }

    return () => {
      // 当 tableProps 中有依赖响应式数据(ref,reactive)，那么应该放到 render 函数中；以确保能够响应 Vue 的更新；
      const tableProps: TableProps<RecordType> = {
        // dataSource: data.value,
        async query(args) {
          console.log('-- 发起请求 --', JSON.parse(JSON.stringify(args)))
          // return

          return {
            data: data.value.map(d => ({ ...d, date: Date.now() })),
            total: 100,
            pageSize: args.pagination?.pageSize,
            current: args.pagination?.current,
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
            customRender: ({ text }) => (
              <Tooltip
                title={<span style={{ color: '#fc6470' }}>芳龄: {text}</span>}
              >{text}</Tooltip>
            ),
          },
          {
            title: '性别',
            dataIndex: 'gender',
            customRender: ({ text }) => text === 1 ? '男' : '女',
          },
          {
            title: '时间',
            dataIndex: 'date',
            customRender: ({ text }) => new Date(text).toLocaleString(),
          },
          {
            title: '操作',
            dataIndex: '操作',
            customRender: () => <Button onClick={reload}>刷新</Button>,
          },
        ],
        // 直接传递 data
        // dataSource: data,
        // 关闭分页
        // pagination: false,
        handle,
        rowKey: 'id',
      }

      return <Table {...tableProps} />
    }
  },
})
