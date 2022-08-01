<template>
  <div>
    <hb-ui-table
      :columns="columns"
      :data="data"
    >
      <!-- TODO: slot -->
    </hb-ui-table>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue'
import {
  Table,
  TableColumn,
  TableData,
} from 'root/components'

export interface RowType {
  name: string
  age: number
  gender: 0 | 1
  date: number
}

export default {
  components: {
    // hb-ui-table | 你可以换成其他名称
    [Table.name]: Table,
  },
  data() {

    return {
      columns: [
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
        },
        {
          label: '时间',
          prop: 'date',
        },
        {
          label: '操作',
          prop: '操作',
        },
      ] as TableColumn<RowType>[],
      data: [
        { name: '张三', age: 23, gender: 1, date: Date.now() },
        { name: '阿宁', age: 24, gender: 0, date: Date.now() },
      ] as TableData<RowType>[],
    }
  }
} as Component

</script>
