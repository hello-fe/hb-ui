<template>
  <hb-ui-form
    :props="props"
    :elements="elements"
    :cache="true"
    :onSubmit="onSubmit"
    :handle="formHandle"
  >
    <template v-slot:height>
      <el-switch
        v-model="props.model.switch"
        active-color="#13ce66"
        inactive-color="#ff4949"
      />
    </template>

    <template v-slot:attack>
      <el-form-item label="攻击" prop="switch1">
        <el-switch
          v-model="props.model.switch1"
          active-color="#13ce66"
          inactive-color="#ff4949"
        />
      </el-form-item>
    </template>
  </hb-ui-form>
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

    const props: FormProps['prop'] = {
      model,
      labelWidth: '87px',
    }

    const formHandle = {};

    const elements: FormProps['elements'] = [
        { label: '年龄', prop: 'age'},
        { label: '地区', prop: 'area', rules: {required: true, message: '填写地区'}},
        { label: '地区', 
          prop: 'area', 
          select: { 
            options: [{label: '1',value:'a'}, {label: '2',value:'b'}],
            // onChange: (e) => { console.log('change', e) },
            on: {
              change: (e)=> {console.log('onChange', e)}
            }
          }
        },
        () => 111,
        'attack',
        {
          label: '身高', 
          prop: 'height',
          slot: true,
        }
        // { label: '时间', prop: 'time', 
        //   datePicker: { type: 'daterange' }
        // },
      ]

    return {
      model,
      elements,
      props,
      formHandle,
    }
  },
  methods: {
      async onSubmit(){
      try { await this.formHandle.validate(); } catch (error) { return; }
      console.log(this.model)
    }
    }
} as Component
</script>

<style>

</style>