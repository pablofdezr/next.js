# AI Content Negotiation Example

This example demonstrates the experimental AI content negotiation feature.
It serves HTML by default and can negotiate Markdown, JSON, or LLM content
via file extensions or Accept headers. It uses Tailwind CSS and the Geist
font via `next/font/google`.

## Run

From the repo root:

```bash
pnpm install
pnpm --filter=next dev
pnpm --filter=example-ai-content-negotiation dev
```

## Routes to Try

- `/` -> home page
- `/ai/sevilla` -> HTML (standard dynamic)
- `/ai/sevilla.md` -> Markdown
- `/trip-to-paris` -> HTML (hybrid route)
- `/trip-to-paris.md` -> Markdown (hybrid route)

## Accept Header Examples

```bash
curl -H "Accept: text/markdown" http://localhost:3000/ai/sevilla
curl -H "Accept: application/json" http://localhost:3000/ai/sevilla
curl -H "Accept: application/llm+json" http://localhost:3000/ai/sevilla
```
