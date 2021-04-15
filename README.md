# NextJS: refreshing props after expired cache

Based on the [examples/with-typescript-eslint-jest](https://github.com/vercel/next.js/tree/canary/examples/with-typescript-eslint-jest)

Demo: https://nextjs-experiment-refresh-after-stale.vercel.app

## What is happening

- You load the page
- Page provides you always with fast cached data. *(always except the very first load)*
- If the provided props are older than 10 seconds, `_app.tsx` will trigger AJAX request to load fresh props.
- Freshly loaded props are swapped for the page `Component`

## Where the magic happens

- `pages/_app_.tsx`
    - using caching utils
- `pages/index.tsx`
    - `loadProps` takes long 5 seconds to load
    - providing cached version of `loadProps`
- `utils/propsMemory.ts`
    - there are caching utils with 10 seconds expiration
