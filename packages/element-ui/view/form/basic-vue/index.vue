<template>
  <hb-ui-form :$props="formProps" />
</template>

<script lang="ts">
import { Component } from 'vue'
import { Form, FormProps } from 'root/components'

export default {
  components: {
    [Form.name]: Form,
  },
  data() {
    const model = { age: 10 };

    const handle = {};

    const items: FormProps['items'] = [
        {
          props: { 
            label: '年龄',
            prop: 'age',
          },
        },
        {
          props: {
            label: '地区',
            prop: 'area',
            rules: { required: true, message: '填写地区' },
          },
        },
        {
          props: {
            label: '地区', 
            prop: 'area',
          },
          select: { 
            options: [
              { label: '1', value: 'a' },
              { label: '2', value:'b' },
            ],
            on: {
              change: (e)=> {console.log('onChange', e)}
            },
          }
        },
        () => 111,
        {
          props: {
            label: '身高', 
            prop: 'height',
          },
        }
        // { label: '时间', prop: 'time', 
        //   datePicker: { type: 'daterange' }
        // },
      ]

    return {
      formProps: {
        props: {
          model,
          labelWidth: '87px',
        },
        items,
        handle,
      }
    }
  },
  methods: {
      async onSubmit(){
      try { await this.handle.validate(); } catch (error) { return; }
      console.log(this.model)
    }
    }
} as Component
</script>

<style>

</style>