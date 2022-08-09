export type KV<V = unknown> = Record<string, V>
export type KVA<V = any> = Record<string, V>

export interface OptionRecord<Raw = unknown> extends KVA {
  label: string
  value: string | number | boolean
  $raw?: Raw
}
