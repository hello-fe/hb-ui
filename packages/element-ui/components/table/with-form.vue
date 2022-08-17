<template>
  <el-form
    ref="formRef"
    :model="formModel"
  >
    <el-table :data="formModel.tableData">
      <template v-for="(col, idx) of columns">
        <el-table-column
          v-if="col.input"
          :key="idx + 'input'"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
        >
          <template slot-scope="scope">
            <el-form-item
              :rules="col.input.rules"
              :prop="`tableData.${scope.$index}.${col.prop}`"
            >
              <el-input
                v-model="scope.row[col.prop]"
                :placeholder="col.input.placeholder || '请输入'"
              />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="col.select"
          :key="idx + 'select'"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
        >
          <template slot-scope="scope">
            <el-form-item
              :rules="col.select.rules"
              :prop="`tableData.${scope.$index}.${col.prop}`"
            >
              <el-select
                v-model="scope.row[col.prop]"
                filterable
                :placeholder="col.select.placeholder || '请选择'"
                @change="onEvent({ name: 'select', action: 'change', $event, scope, column: col })"
                @focus="onEvent({ name: 'select', action: 'focus', $event, scope, column: col })"
                @blur="onEvent({ name: 'select', action: 'blur', $event, scope, column: col })"
              >
                <el-option
                  v-for="(opt, optIdx) of optionsCallable(col.select.options, scope)"
                  :key="optIdx"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="col.render"
          :key="idx + 'render'"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
        >
          <template slot-scope="scope">
            <render-cell
              :props="col"
              :scope="scope"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-else
          :key="idx + 'column'"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
        />
      </template>
    </el-table>
  </el-form>
</template>

<script>
/**
 * TODO 功能完善 211129
 */
export default {
  name: 'EnhanceTableWithFormVue',
  components: {
    RenderCell: {
      props: {
        props: Object,
        scope: Object,
      },
      render() {
        return this.$props.props.render(this.$props.scope)
      },
    },
  },
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    pagination: {
      type: [Boolean, Object],
      default: () => ({}),
    },
    query: {
      type: Object,
      default: () => ({}),
    },
    handle: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      formModel: {
        tableData: this.$props.data,
      },
    }
  },
  watch: {
    data(val) {
      this.formModel.tableData = val
    },
  },
  mounted() {
    Object.assign(this.$props.handle, {
      // TODO
      refresh() {},
      // TODO
      pagination: {},
      form: this.$refs.formRef,
    })
  },
  methods: {
    optionsCallable(arg0, scope) {
      return typeof arg0 === 'function' ? arg0(this.argsify(scope)) : arg0
    },
    argsify(scope) {
      return {
        $index: scope.$index,
        column: { ...scope.column, prop: scope.column.property },
        row: this.formModel.tableData[scope.$index],
      }
    },
    onEvent({
      name,
      $event,
      action,
      scope,
      column,
    }) {
      const args = { $event, ...this.argsify(scope) }
      if (action === 'blur') {
        if (column[name].onBlur) { column[name].onBlur(args) }
      } else if (action === 'focus') {
        if (column[name].onFocus) { column[name].onFocus(args) }
      } else if (action === 'change') {
        if (column[name].onChange) { column[name].onChange(args) }
      }
    },
  },
}
</script>
