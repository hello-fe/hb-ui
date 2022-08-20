import Vue, { VNode, ComponentOptions } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode { }
    interface ElementClass extends Vue { }
    interface IntrinsicElements {
      [elem: string]: {
        class?: string
        [atts: string]: any
      }
    }
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions extends Record<PropertyKey, any> { }
}
