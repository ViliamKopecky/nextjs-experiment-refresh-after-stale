import React from 'react'

// Types

export enum MemoryStatus {
  Ok = 'ok',
  Expired = 'expired',
  Fresh = 'fresh',
}

export type PagePropsMemoryExtension = { _memory: { status: MemoryStatus } }

// Browser

export const useFreshPageProps = (
  initialPageProps: Partial<PagePropsMemoryExtension>
) => {
  const [refreshing, setRefreshing] = React.useState(false)
  const [freshPageProps, setFreshPageProps] = React.useState(initialPageProps)

  React.useEffect(() => {
    if (freshPageProps?._memory.status === MemoryStatus.Expired) {
      setRefreshing(true)
      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search.slice(1))
      params.append('json', '')

      url.search = params.toString()

      let mounted = true

      fetch(url.toString())
        .then((r) => r.json())
        .then((data) => {
          if (mounted) {
            setFreshPageProps(data)
            setRefreshing(false)
          }
        })

      return () => (mounted = false)
    }
    return () => undefined
  }, [])

  return { refreshing, props: freshPageProps }
}

// Server

const getMemoryStorage = () => {
  // Should be Redis or somethint
  if (!('ssrMemory' in globalThis)) {
    globalThis.ssrMemory = {}
  }
  return globalThis.ssrMemory
}

export const fromMemory = async <
  Result extends { props: Record<string, unknown> }
>(
  key: string,
  loader: () => Promise<Result> | Result,
  forceNew = false,
  seconds = 10
): Promise<
  Result['props'] & {
    _memory: {
      status: MemoryStatus
    }
  }
> => {
  const memory = getMemoryStorage()

  const now = new Date().getTime()

  if (!forceNew) {
    const existingRecord = memory[key]
    if (existingRecord) {
      if (existingRecord.time < now - seconds * 1000) {
        return {
          _memory: { status: MemoryStatus.Expired },
          ...existingRecord.data.props,
        }
      } else {
        return {
          _memory: { status: MemoryStatus.Ok },
          ...existingRecord.data.props,
        }
      }
    }
  }

  const data = await loader()

  const record = {
    time: now,
    data,
  }

  memory[key] = record

  return { _memory: { status: MemoryStatus.Fresh }, ...record.data.props }
}
