import type {
  ExperimentalAIContent,
  ExperimentalAIContentContext,
} from 'next/experimental'

export const experimentalAIFormats = ['markdown', 'json'] as const

export default async function Page({
  params,
}: {
  params: Promise<{ destination: string }>
}) {
  const { destination } = await params
  return (
    <div className="border border-slate-200 p-6 rounded-lg">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">
        Hybrid Route
      </div>
      <h1 className="text-2xl font-bold mb-4">Trip to {destination}</h1>
      <p className="text-slate-600">
        This demonstrates AI content negotiation on a hybrid route segment 
        <code>/trip-to-[destination]</code>.
      </p>
    </div>
  )
}

export async function experimentalGenerateAI(
  ctx: ExperimentalAIContentContext
): Promise<ExperimentalAIContent> {
  const destination = ctx.params.destination as string

  return {
    markdown: `# Trip Plan for ${destination}

This is a dynamic AI response for a trip to **${destination}**.

## Itinerary
- Day 1: Arrive in ${destination}
- Day 2: Explore the city
`,
    json: {
      destination,
      type: 'trip-plan',
      generatedAt: new Date().toISOString(),
    },
  }
}
