import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import React from 'react'
import { fromMemory } from '../utils/propsMemory'

export const Home = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
): JSX.Element => {
  return (
    <div>
      <h1>Refresh after stale</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      <p><a href="https://github.com/ViliamKopecky/nextjs-experiment-refresh-after-stale">Github repo of this project</a></p>
    </div>
  )
}

export default Home

// Server

const wait = (seconds = 1) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000))

const loadProps = async () => {
  await wait(5)
  return {
    props: {
      random: Math.random(),
      timestamp: new Date().toLocaleString(),
    },
  }
}
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const requiresFreshData =
    context.req.headers.accept === 'application/json' ||
    typeof context.query.json !== 'undefined'

  const data = await fromMemory('memoryKey', loadProps, requiresFreshData)

  if (requiresFreshData) {
    context.res.setHeader('Content-Type', 'application/json;charset=utf-8')
    context.res.write(JSON.stringify(data, null, 2))
    context.res.end()
    return {
      props: data,
    }
  }

  return {
    props: data,
  }
}