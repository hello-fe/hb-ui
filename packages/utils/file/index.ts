
/** Read files by input */
export function readFile(options: { input?: Partial<HTMLInputElement> } = {}) {
  return new Promise<FileList>((resolve) => {
    const oInput = document.createElement('input') as HTMLInputElement
    oInput.type = 'file'
    if (options.input) Object.entries(options.input).forEach(([attr, value]) => {
      oInput[attr] = value
    })
    oInput.onchange = (ev) => {
      resolve((ev.target as Record<PropertyKey, any>).files)
    }
    oInput.click()
  })
}

export interface UploadOptions<ActionT = any> {
  action?: (formData: FormData, data: { files: FileList, file: File, [key: string]: any }) => ActionT | Promise<ActionT>,
  data?:
  | Record<string, any>
  | ((d: { files: FileList, file: File, [key: string]: any }) => typeof d | Promise<typeof d>)
  readFile?: false | Parameters<typeof readFile>[0],
}
/** Upload files to server */
export async function upload<ActionT = any>(options: UploadOptions<ActionT>) {
  const { data, action, readFile: readFileOptions } = options
  let _data: Record<string, any> = {}
  let files: FileList

  if (readFileOptions !== false) {
    files = await readFile(readFileOptions)

    // set default value
    if (readFileOptions?.input?.multiple) {
      _data.files = files
    } else {
      _data.file = files[0]
    }
  }

  if (typeof data === 'function') {
    _data = await data({ files, file: files[0] })
  } else {
    Object.assign(_data, data)
  }

  const formData = new FormData()
  for (const [k, v] of Object.entries(_data)) {
    formData.append(k, v)
  }

  return action?.(formData, _data as any)
}

/**
 * TODO: 2022-08-22
 */
export function download() {

}

/**
 * TODO: 2022-08-22
 */
export function save() {

}
