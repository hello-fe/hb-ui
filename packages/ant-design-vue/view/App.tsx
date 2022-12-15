import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import Layout from './Layout'

export default defineComponent({
  setup() {

    return () => (
      <Layout>
        <RouterView />
      </Layout>
    )
  },
})
