
export { }

declare global {
  type KV<V = unknown> = Record<string, V>
  type KVA<V = any> = Record<string, V>

  interface OptionRecord<Raw = unknown> extends KVA {
    label: string
    value: string | number | boolean
    $raw?: Raw
  }

  type JSX_ELEMENT = JSX.Element | number | string | null
}
