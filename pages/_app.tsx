import { AppProps } from 'next/dist/next-server/lib/router/router'
import React from 'react'
import {
  PagePropsMemoryExtension,
  useFreshPageProps,
} from '../utils/propsMemory'

export default function App(
  props: AppProps & { pageProps: Partial<PagePropsMemoryExtension> }
): JSX.Element {
  const { Component, pageProps } = props

  const fresh = useFreshPageProps(pageProps)

  props.Component

  return (
    <div>
      {fresh.refreshing && <div>loading fresh props...</div>}
      <Component {...(fresh.props as any)} />
    </div>
  )
}
