import { Form, FormProps } from 'root/components'
import { Component } from 'vue'

const FormTsx: Component = {
  data() {
    const formModel = { area: '1', age: '10' }
    const formHandle = {}
    return {
      formModel,
      formHandle,
    }
  },
  methods: {
    async onSubmit() {
      try { await this.formHandle.validate(); } catch (error) { return; }
      console.log(this.formModel)
    }
  },
  render() {
    const formProps: FormProps = {
      cache: { filterKey: 'filterData' },
      onSubmit: this.onSubmit,
      handle: this.formHandle,
      items: [
        {
          label: '地区',
          prop: 'area',
          select: {
            options: [
              { value: '1', label: 'one' },
              { value: '2', label: 'two' },
            ],
            on: {
              change: (e) => { console.log('change', e) },
              input: (e) => { console.log('input', e) },
            },
            // onChange: (e)=>{console.log(22, e)},
            // onInput: (e)=>{console.log(33, e)},
            clearable: true,
          },
          rules: { required: true, message: '请选择地区' },
        },
        {
          label: '姓名',
          prop: 'name',
          rules: { required: true, message: '请输入姓名' },
          // $scopedSlots: {
          //   label: () => <span><i class='el-icon-s-flag' />年龄</span>
          // }
        },
        {
          label: '年龄',
          prop: 'age',
          input: {
            // on: {
            //   change: (e) => console.log('change', e),
            //   input: (e) => console.log('input', e),
            //   focus: (e) => console.log('focus', e),
            // },
            // maxlength: 2,
            onChange: (e) => { console.log(222, e) },
            // clearable: true,
            // prefixIcon: "el-icon-search",
            // suffixIcon: "el-icon-search",
          },
          scopedSlots2: {
            label: () => <span><i class='el-icon-s-flag' /></span>
          }
        },
        // {
        //   label: '完成时间',
        //   prop: 'finishDate',
        //   datePicker: {
        //     type: 'daterange',
        //     on: {
        //       change: (e)=>console.log(111,e),
        //       input: (e)=>console.log(222,e),
        //       focus: (e)=>console.log(333,e),
        //     }
        //   }
        // }
      ],
      model: this.formModel,
      labelWidth: '87px',
      style: 'color: #fa6470',
      inline: false,
    }

    return (
      <Form $props={formProps} />
    )
  },
}

export default FormTsx as any
