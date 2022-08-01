import Vue, { VNode } from 'vue'

export type KV<V = unknown> = Record<string, V>
export type KVA<V = any> = Record<string, V>

export interface OptionRecord<Raw = unknown> extends KVA {
  label: string
  value: string | number | boolean
  $raw?: Raw
}

export type JSX_ELEMENT = JSX.Element | number | string | null

export namespace JSX {
  interface Element extends VNode { }
  interface ElementClass extends Vue { }
  interface IntrinsicElements {
    [elem: string]: {
      class?: string
      [atts: string]: any
    }
  }
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
