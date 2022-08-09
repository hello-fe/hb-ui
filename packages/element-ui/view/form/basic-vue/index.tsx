import { Form, FormProps } from 'root/components'
import { Component } from 'vue'

const FormTsx: Component = {
  data() {
    const formModel = {area:'1',age:'10'}
    const formHandle = {}
    return {
      formModel,
      formHandle,
    }
  },
  methods: {
    async onSubmit(){
      try { await this.formHandle.validate(); } catch (error) { return; }
      console.log(this.formModel)
    }
  },
  render() {
    const formProps: FormProps = {
      cache: true,
      onSubmit: this.onSubmit,
      handle: this.formHandle,
      elements: [
        {
          label: '地区',
          prop: 'area',
          select: {
            options: [
              { value: '1', label: 'one' },
              { value: '2', label: 'two' },
            ],
            on: {
              // change: (e) => { console.log('change', e) },
            },
            onChange: (e)=>{console.log(22,e)},
            clearable: true,
          },
          rules: { required: true, message: '请选择地区' },
        },
        {
          label: '凭证类别',
          prop: 'voucherCategory',
          rules: { required: true, message: '请输入凭证类别' },
        },
        {
          label: '年龄',
          prop: 'age',
          input: {
            on: {
              // change: (e)=>console.log('change',e),
              // input: (e)=>console.log('input',e),
              // focus: (e)=>console.log('focus',e),
            },
            maxlength: 2,
            onChange: (e)=>{console.log(222,e)},
            clearable: false,
          },
          $scopedSlots: {
            label: () => <div>11</div>
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
      props: {
        model: this.formModel,
        labelWidth: '87px',
        inline: true,
      }
    }

    return (
      <div>
        <Form {...{ props: formProps }} />
      </div>
    )
  },
}

export default FormTsx as any
