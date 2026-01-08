# Hybrid Routing Example (Next.js 16)

This example showcases hybrid route segments such as `/house-in-[location]`
alongside static, dynamic, and catch-all routes in the App Router. It uses
Tailwind CSS and the Geist font via `next/font/google`.

## Run

From the repo root:

```bash
pnpm install
pnpm --filter=next dev
pnpm --filter example-hybrid-routing dev
```

## Routes to Try

- `/house-in-nyc` -> static route
- `/house-in-sf` -> hybrid segment
- `/foo` -> dynamic route
- `/foo/bar` -> catch-all route
