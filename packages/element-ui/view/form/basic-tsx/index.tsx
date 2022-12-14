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
      cache: {},
      onSubmit: this.onSubmit,
      onReset: this.onSubmit,
      handle: this.formHandle,
      items: [
        {
          // 属性写在顶级
          label: '地区',
          prop: 'area',
          props: {
            // rules: { required: true, message: '请选择地区' },
          },
          select: {
            options: [
              { value: '1', label: 'one' },
              { value: '2', label: 'two' },
            ],
            on: {
              change: (e) => { console.log('change', e) },
              input: (e) => { console.log('input', e) },
            },
            props: {
              clearable: true,
            }
          },
        },
        {
          props: {
            // 属性写在 props
            label: '姓名',
            prop: 'name',
            // rules: { required: true, message: '请输入姓名' },
            // TODO: ❌
            scopedSlots: () => ({
              error: <span><i class='el-icon-s-flag' />阿塞阀塞阀</span>
            }),
          },
          attrs: {},
        },
        {
          props: {
            label: '年龄',
            prop: 'age',
          },
          input: {
            on: {
              change: (e) => console.log('change', e),
              input: (e) => console.log('input', e),
              focus: (e) => console.log('focus', e),
            },
            attrs: {
              maxlength: 9,
              placeholder: 'maxlength=9',
              prefixIcon: "el-icon-search",
              suffixIcon: "el-icon-search",
            },
          },
        },
        // {
        //   props: {
        //     label: '完成时间',
        //     prop: 'finishDate',
        //   },
        //   datePicker: {
        //     props: {
        //       type: 'daterange',
        //     },
        //     on: {
        //       change: (e)=>console.log(111,e),
        //       input: (e)=>console.log(222,e),
        //       focus: (e)=>console.log(333,e),
        //     }
        //   },
        // }
      ],
      props: {
        model: this.formModel,
        labelWidth: '87px',
      },
      style: 'color: #fa6470',
      // class: 'test-form',
      on: {
        validate() {},
      },
    }

    return (
      <Form $props={formProps} />
    )
  },
}

export default FormTsx as any
