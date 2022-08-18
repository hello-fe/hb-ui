
export interface OptionRecord<Raw = Record<PropertyKey, any>> extends Record<PropertyKey, any> {
  label: string
  value: string | number | boolean
  $raw?: Raw
}

export type JSX_ELEMENT = import('vue').VNode | number | string | null
