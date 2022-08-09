import { Form, FormProps } from 'root/components'
import { Component } from 'vue'

const FormTsx: Component = {
  data() {
    const formModel = {}

    return {
      formModel,
    }
  },
  render() {
    const formProps: FormProps = {
      model: this.formModel,
      labelWidth: '87px',
      cache: true,
      elements: [
        {
          label: '地区',
          name: 'area',
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
          rules: { required: true, message: '11' },
        },
        {
          label: '年龄',
          name: 'age',
          input: {
            on: {
              // change: (e)=>console.log('change',e),
              // input: (e)=>console.log('input',e),
              // focus: (e)=>console.log('focus',e),
            },
            maxlength: 2,
            onChange: (e)=>{console.log(222,e)},
          },
        },
        // {
        //   label: '完成时间',
        //   name: 'finishDate',
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
    }

    return (
      <div>
        <Form {...{ props: formProps }}></Form>
      </div>
    )
  },
}

export default FormTsx as any
