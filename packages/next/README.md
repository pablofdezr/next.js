# next-hybrid

Hybrid routing build of Next.js with support for hybrid route segments in the
App Router (for example `/house-in-[city]`) and **experimental AI Content Negotiation**.

## Features

### Hybrid Routing
- Hybrid segments combine static and dynamic parts in a single segment.
- Routing priority remains: static > hybrid > dynamic > catch-all.
- Works with the App Router layouts and params API.

### AI Content Negotiation (Experimental)
- Serve Markdown, JSON, or LLM-optimized payloads from the same route.
- Negotiate content via file extension (e.g. `.md`, `.json`) or `Accept` header.
- Define `experimentalGenerateAI` in your page to produce these formats.

## Create a new app (floating latest)

### npm

```bash
npx create-next-app@latest my-app
cd my-app
npm install next@npm:next-hybrid
npm run dev
```

### pnpm

```bash
pnpm create next-app@latest my-app
cd my-app
pnpm add next@npm:next-hybrid
pnpm dev
```

### bun

```bash
bunx create-next-app@latest my-app
cd my-app
bun add next@npm:next-hybrid
bun run dev
```

### Sanity check (package.json)

```json
{
  "dependencies": {
    "next": "npm:next-hybrid",
    "react": "...",
    "react-dom": "..."
  }
}
```

## Hybrid Routing Example

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

## AI Content Negotiation Example

Define a page that exports `experimentalGenerateAI`:

```tsx
// app/ai/[slug]/page.tsx
import type { ExperimentalAIContent, ExperimentalAIContentContext } from 'next/experimental'

export const experimentalAIFormats = ['markdown', 'json'] as const

export default function Page({ params }) {
  return <h1>HTML View</h1>
}

export async function experimentalGenerateAI(ctx: ExperimentalAIContentContext): Promise<ExperimentalAIContent> {
  const { slug } = ctx.params as { slug: string }
  return {
    markdown: `# Content for ${slug}`,
    json: { slug, type: 'generated' }
  }
}
```

Access via:
- `/ai/foo` -> HTML
- `/ai/foo.md` -> Markdown
- `/ai/foo.json` -> JSON

## Repository

https://github.com/pablofdezr/next.js

## Links

📦 https://www.npmjs.com/package/next-hybrid
🔧 https://github.com/pablofdezr/next.js