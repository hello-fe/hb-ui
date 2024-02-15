import React, { useMemo, useState, useRef } from 'react'

const isUndef = (value: unknown): value is undefined =>
  typeof value === 'undefined'

type noop = (this: any, ...args: any[]) => any

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>

function useMemoizedFn<T extends noop>(fn: T) {
  if (typeof fn !== 'function') {
    console.error(
      `useMemoizedFn expected parameter is a function, got ${typeof fn}`
    )
  }

  const fnRef = useRef<T>(fn)

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn])

  const memoizedFn = useRef<PickFunction<T>>()
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args)
    }
  }

  return memoizedFn.current as T
}

export type RowSelectionType = 'checkbox' | 'radio'
export type RowSelectMethod = 'all' | 'none' | 'invert' | 'single' | 'multiple'
export type GetRowKey<RecordType> = (record: RecordType) => React.Key

export interface AntdTableRowSelection<RecordType> {
  type: RowSelectionType
  selectedRowKeys: React.Key[]
  defaultSelectedRowKeys: React.Key[]
  getCheckboxProps: (row: RecordType) => Partial<{ disabled: boolean }>
  onChange: (
    selectedRowKeys: React.Key[],
    selectedRows: RecordType[],
    info: { type: RowSelectMethod }
  ) => void
  rowKey: string | keyof RecordType | GetRowKey<RecordType>
  disabled: boolean | ((row: RecordType) => boolean)
  [key: string]: any
}

export interface AntdTableSelectionResult<RecordType> {
  state: {
    allSelected: boolean
    selectedRows: RecordType[]
    selectedRowKeys: React.Key[]
  }
  action: {
    select: (item: RecordType) => void
    toggle: (item: RecordType) => void
    unSelect: (item: RecordType) => void
    toggleAll: () => void
    selectAll: () => void
    isSelected: (item: RecordType) => boolean
    unSelectAll: () => void
    setSelected: (keys: React.Key[]) => void
  }
  rowSelection: Omit<AntdTableRowSelection<RecordType>, 'rowKey' | 'disabled'>
}

function useAntdTableSelection<RecordType>(
  rows: RecordType[] = [],
  config?: Partial<AntdTableRowSelection<RecordType>>
): AntdTableSelectionResult<RecordType> {
  if (!isUndef(config?.rowKey)) {
    console.error(
      `useAntdTableSelection expected config.rowKey is a function|string|number, got undefined.
        Will default to using "key" as rowKey.
        The value must be the same as the rowKey of the Antd Table component`
    )
  }

  const {
    rowKey = 'key',
    disabled = false,
    type = 'checkbox',
    defaultSelectedRowKeys = [],
    ...rest
  } = config || {}

  const getRowKey = React.useMemo<GetRowKey<RecordType>>(() => {
    if (typeof rowKey === 'function') {
      return rowKey
    }

    return (record: RecordType) => (record as any)?.[rowKey]
  }, [rowKey])

  const allRowKeys = useMemo(() => rows.map((t) => getRowKey(t)), [rows])

  const rowKeyMapRow = React.useMemo(
    () =>
      rows.reduce<Record<React.Key, RecordType>>((prev, cur) => {
        prev[getRowKey(cur)] = cur
        return prev
      }, {}),
    [rows]
  )

  // ========================= States =========================
  const [selectedRows, setSelectedRows] = useState<RecordType[]>(
    defaultSelectedRowKeys
      .map((key) => rowKeyMapRow[key])
      .filter((t) => !isUndef(t))
  )
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(
    defaultSelectedRowKeys
  )

  const getDisabled = React.useMemo(() => {
    if (typeof disabled === 'function') {
      return (row: RecordType) => disabled(row)
    }
    if (typeof disabled === 'boolean') {
      return () => disabled
    }
    return () => false
  }, [disabled])

  const getCheckboxProps = useMemoizedFn((row: RecordType) => {
    const checkboxProps =
      typeof rest?.getCheckboxProps === 'function'
        ? rest.getCheckboxProps?.(row)
        : {}

    return Object.assign({ disabled: getDisabled(row) }, checkboxProps)
  })

  const isValidRow = useMemoizedFn(
    (row: RecordType) =>
      !getCheckboxProps(row).disabled && allRowKeys.includes(getRowKey(row))
  )

  // ========================= Funcs =========================
  const onSelectionChange: AntdTableRowSelection<RecordType>['onChange'] =
    useMemoizedFn((rowKeys, records, info) => {
      setSelectedRows(records)
      setSelectedRowKeys(rowKeys)
      rest?.onChange?.(rowKeys, records, info)
    })

  const onRowsChange = useMemoizedFn((records: RecordType[]) => {
    /** based action change state, must have rowKey and row is't disabled.
     *  because of this, the config.rowKey is must
     */
    const willSelected = records.filter((t) => isValidRow(t))
    setSelectedRows(willSelected)
    setSelectedRowKeys(willSelected.map((t) => getRowKey(t)))
  })

  // ========================= Select Memo States =========================
  const selectedSet = useMemo(() => new Set(selectedRows), [selectedRows])

  const noneSelected = useMemo(
    () => rows.every((o) => !selectedSet.has(o)),
    [rows, selectedSet]
  )

  const allSelected = useMemo(
    () =>
      rows.filter((t) => !getCheckboxProps(t).disabled).length ===
        selectedRows.length && !noneSelected,
    [rows, selectedSet, noneSelected]
  )

  // ========================= Select Action =========================
  const isSelected = useMemoizedFn((item: RecordType) => selectedSet.has(item))

  const select = useMemoizedFn((item: RecordType) => {
    if (isValidRow(item)) {
      selectedSet.add(item)
      onRowsChange(Array.from(selectedSet))
    }
  })

  const unSelect = useMemoizedFn((item: RecordType) => {
    selectedSet.delete(item)
    onRowsChange(Array.from(selectedSet))
  })

  const selectAll = useMemoizedFn(() => {
    selectedSet.clear()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (isValidRow(row)) {
        selectedSet.add(row)
        if (type === 'radio') break
      }
    }

    onRowsChange(Array.from(selectedSet))
  })

  const unSelectAll = useMemoizedFn(() => {
    selectedSet.clear()
    onRowsChange(Array.from(selectedSet))
  })

  const toggle = useMemoizedFn((item: RecordType) => {
    if (isSelected(item)) {
      unSelect(item)
    } else {
      select(item)
    }
  })

  const toggleAll = useMemoizedFn(() =>
    allSelected ? unSelectAll() : selectAll()
  )

  const setSelected = useMemoizedFn((rowKeys: React.Key[]) => {
    selectedSet.clear()

    const willRowKeys: React.Key[] = []
    let key: any = null
    let row: any = null

    for (let i = 0; i < rowKeys.length; i++) {
      key = rowKeys[i]
      row = rowKeyMapRow[key]
      if (isValidRow(row)) {
        selectedSet.add(rowKeyMapRow[key])
        willRowKeys.push(key)
        /* if type is radio, should be used the first */
        if (type === 'radio') break
      }
    }

    setSelectedRows(Array.from(selectedSet))
    setSelectedRowKeys(willRowKeys)
  })

  return {
    state: {
      allSelected,
      selectedRows,
      selectedRowKeys,
    },
    action: {
      select,
      toggle,
      unSelect,
      toggleAll,
      selectAll,
      isSelected,
      unSelectAll,
      setSelected,
    },
    rowSelection: {
      ...rest,
      type,
      onChange: onSelectionChange,
      getCheckboxProps,
      selectedRowKeys,
      defaultSelectedRowKeys,
    },
  }
}

export default useAntdTableSelection
