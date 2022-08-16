
export interface OptionRecord<Raw = Record<string, any>> extends Record<string, any> {
  label: string
  value: string | number | boolean
  $raw?: Raw
}

export type JSX_ELEMENT = import('vue').VNode | number | string | null
