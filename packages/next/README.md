# next-hybrid

Hybrid routing build of Next.js with support for hybrid route segments in the
App Router (for example `/house-in-[city]`).

## What's new

- Hybrid segments combine static and dynamic parts in a single segment.
- Routing priority remains: static > hybrid > dynamic > catch-all.
- Works with the App Router layouts and params API.

## Install

```bash
npm i next-hybrid
```

## Example

```txt
/house-in-nyc           -> static
/house-in-[city]        -> hybrid
/[slug]                 -> dynamic
/[...slug]              -> catch-all
/[[...slug]]            -> optional catch-all
```

```tsx
// app/house-in-[city]/page.tsx
export default async function Page({ params }) {
  const { city } = await params
  return <h1>Houses in {city}</h1>
}
```

## Repository

https://github.com/pablofdezr/next.js
