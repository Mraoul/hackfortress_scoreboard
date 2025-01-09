import { getJwtToken, delJwtToken } from './Session'
interface MakeFetchArgsInterface {
  url: string
  method?: string
  body?: null | {
    [key: string]: any
  }
  sendToken?: boolean
  formData?: null | FormData
  successFn?: null | ((data: { [key: string]: any }) => void)
  unauthorizedFn?: null | ((data: { [key: string]: any }) => void)
  forbiddenFn?: null | ((data: { [key: string]: any }) => void)
  statusFns?: null | {
    [key: string]: (data: { [key: string]: any }) => void
  }
  multiStatusFns?: null | Array<{
    statuses: Array<number>
    func: (data: { [key: string]: any }) => void
  }>
  unexpectedRespFn?:
    | null
    | ((data: { [key: string]: any }, response: Response) => void)
  always?: null | (() => void)
  onError?: null | ((error: any) => void)
}

export async function makeFetch({
  url,
  method = 'GET',
  body = null,
  sendToken = true,
  formData = null,
  successFn = null,
  forbiddenFn = null,
  unauthorizedFn = null,
  statusFns = null,
  multiStatusFns = null,
  unexpectedRespFn = null,
  onError = null,
  always = null,
}: MakeFetchArgsInterface) {
  try {
    let request_body: string | FormData | null = null
    let request_headers: { [key: string]: string } = {}

    if (body != null) {
      request_headers['Content-Type'] = 'application/json'
      request_body = JSON.stringify(body)
    } else if (formData != null) {
      request_body = formData
    }

    if (sendToken) {
      request_headers['Authorization'] = `Bearer ${getJwtToken()}`
    }

    let response = await fetch(url, {
      method: method,
      credentials: 'same-origin',
      headers: request_headers,
      body: request_body,
    })

    let data: { [key: string]: any }
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (response.status == 200) {
      if (successFn != null) {
        successFn(data)
      }
    } else if (response.status == 401) {
      if (unauthorizedFn != null) {
        unauthorizedFn(data)
      } else {
        // Delete the jwt token
        delJwtToken()
      }
    } else if (response.status == 403) {
      if (forbiddenFn != null) {
        forbiddenFn(data)
      }
    } else if (
      statusFns != null &&
      Object.keys(statusFns).includes(response.status.toString())
    ) {
      statusFns[response.status.toString()](data)
    } else if (multiStatusFns != null) {
      multiStatusFns.forEach((entry) => {
        if (response.status in entry.statuses) {
          entry.func(data)
        }
      })
    } else {
      if (unexpectedRespFn != null) {
        unexpectedRespFn(data, response)
      } else {
        console.log(response)
      }
    }
  } catch (error: any) {
    if (onError !== null) {
      onError(error)
    } else {
      console.error(error)
    }
  } finally {
    if (always !== null) {
      always()
    }
  }
}

interface downloadFileInterface {
  fileUrl: string
  unauthorizedFn?: null | ((data: { [key: string]: any }) => void)
  forbiddenFn?: null | ((data: { [key: string]: any }) => void)
  statusFns?: null | {
    [key: string]: (data: { [key: string]: any }) => void
  }
  multiStatusFns?: null | Array<{
    statuses: Array<number>
    func: (data: { [key: string]: any }) => void
  }>
  unexpectedRespFn?:
    | null
    | ((data: { [key: string]: any }, response: Response) => void)
  always?: null | (() => void)
  onError?: null | ((error: any) => void)
  setDownloading?: React.Dispatch<React.SetStateAction<boolean>>
}

export async function downloadFile({
  fileUrl,
  forbiddenFn = null,
  unauthorizedFn = null,
  statusFns = null,
  multiStatusFns = null,
  unexpectedRespFn = null,
  onError = null,
  always = null,
  setDownloading = undefined,
}: downloadFileInterface) {
  try {
    let request_headers: { [key: string]: string } = {}
    request_headers['Authorization'] = `Bearer ${getJwtToken()}`

    let response = await fetch(fileUrl, {
      method: 'GET',
      headers: request_headers,
    })

    if (response.status == 200) {
      const header = response.headers.get('Content-Disposition')
      const parts = header!.split(';')
      let filename = parts[1].split('=')[1].replace(/"/g, '')

      if (!filename.includes('.')) {
        filename += '.file'
      }

      if (setDownloading !== undefined) {
        setDownloading(true)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(new Blob([blob]))

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)

      // Append to html link element page
      document.body.appendChild(link)

      // Start download
      link.click()

      // Clean up and remove the link
      link.parentNode!.removeChild(link)
      return
    }

    let data: { [key: string]: any }
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (response.status == 401) {
      if (unauthorizedFn != null) {
        unauthorizedFn(data)
      } else {
        // Delete the jwt token
        delJwtToken()
      }
    } else if (response.status == 403) {
      if (forbiddenFn != null) {
        forbiddenFn(data)
      }
    } else if (
      statusFns != null &&
      Object.keys(statusFns).includes(response.status.toString())
    ) {
      statusFns[response.status.toString()](data)
    } else if (multiStatusFns != null) {
      multiStatusFns.forEach((entry) => {
        if (response.status in entry.statuses) {
          entry.func(data)
        }
      })
    } else {
      if (unexpectedRespFn != null) {
        unexpectedRespFn(data, response)
      } else {
        console.log(response)
      }
    }
  } catch (error: any) {
    if (onError !== null) {
      onError(error)
    } else {
      console.error(error)
    }
  } finally {
    if (always !== null) {
      always()
    }

    if (setDownloading !== undefined) {
      setDownloading(false)
    }
  }
}

// export async function makeFetch(args) {
//   try {
//     await _makeFetch(args)
//   } catch (e) {
//     console.error(e)
//   }
// }
