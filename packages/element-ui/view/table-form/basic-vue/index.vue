<template>
  <div>
    <hb-ui-form :$props="formProps" />
    <hb-ui-form-table :$props="tableProps" />
  </div>
</template>

<script lang="jsx">
import {
  Form,
  Table,
} from '@hb-ui/element-ui';

export default {
  components: {
    [Form.name]: Form,
    [Table.name]: Table,
  },
  data() {
    /** @type {import('@hb-ui/element-ui').FormProps} */
    const formProps = {
      handle: {},
      props: {
        model: { select1: 'front-end' },
        labelWidth: '87px',
      },
      items: /* poseidon:form.items */[
        {
          label: '文本字段',
          prop: 'text1',
          rules: { required: true, message: '必填' },
        },
        {
          label: '下拉选项',
          prop: 'select1',
          select: {
            options: [
              { label: '前端', value: 'front-end' },
              { label: '后端', value: 'back-end' },
            ],
            on: {
              change: (value) => {
                console.log('[onChange] value is:', value);
              },
            },
          },
        },
        {
          label: '时间',
          prop: 'time',
          datePicker: { type: 'daterange' },
        },
      ],
      onSubmit: this.onSubmit,
      onReset: this.onSubmit,
    };

    /** @type {import('@hb-ui/element-ui').TableProps} */
    const tableProps = {
      handle: {},
      columns: /* poseidon:table.columns */[
        {
          label: '姓名',
          prop: 'name',
          tooltip: {},
        },
        {
          label: '年龄',
          prop: 'age',
        },
        {
          label: '性别',
          prop: 'gender',
          render: ({ row }) => (row.gender === 1 ? '男' : '女'),
        },
        {
          label: '时间',
          prop: 'date',
        },
        {
          label: '操作',
          prop: '操作',
          // 自定义渲染组件情况下推荐使用 <script lang="jsx"> 如果你不是熟悉 h 渲染函数用法 :)
          render: ({ row }) => (
            <el-button
              type='text'
              onClick={() => { this.$message(JSON.stringify(row)); }}
            >查看</el-button>
          ),
        },
      ],
      // 也可以这里传入数据，和 query 返回的数据可以共存
      data: [],
      async query(args) {
        // args 完整定义 - https://github.com/hello-fe/hb-ui/blob/e6a72fcea8d28c64acdece45d325a77bb92313f5/packages/element-ui/components/table/index.tsx#L76-L82
        console.log('-- 发起请求 --', JSON.parse(JSON.stringify(args)))

        return {
          data: [
            { name: '张三', age: 23, gender: 1, date: Date.now() },
            { name: '阿宁', age: 24, gender: 0, date: Date.now() },
          ],
          ...args.pagination,
        };
      },
    };

    return {
      formProps,
      tableProps,
    }
  },
  methods: {
    async onSubmit() {
      // Form 校验
      try { await this.formProps.handle.validate(); } catch (error) { return; }

      // Form 数据
      console.log('[Form] value is:', this.formProps.props.model);

      // 联动表格发起请求
      this.tableProps.handle.query({
        // 通过 payload 字段传递表单数据给表格
        payload: this.formProps.props.model,
      });
    },
  },
};
</script>
