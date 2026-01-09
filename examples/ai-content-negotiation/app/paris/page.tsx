import type {
  ExperimentalAIContent,
  ExperimentalAIContentContext,
} from "next/experimental";

export const experimentalAIFormats = ["markdown", "json", "llm"] as const;

const CITY = {
  slug: "paris",
  name: "Paris",
  summary: "Iconic city of art, food, and history.",
  highlights: ["Eiffel Tower", "Louvre", "Montmartre"],
};

export default async function Page() {
  return (
    <article className="border border-slate-200 p-6 rounded-lg">
      <h1 className="text-3xl font-semibold text-slate-900 mb-4">
        {CITY.name}
      </h1>
      <p className="text-lg text-slate-700 mb-6">{CITY.summary}</p>
      <ul className="list-disc pl-5 space-y-2 text-slate-600">
        {CITY.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </article>
  );
}

export async function experimentalGenerateAI(
  _ctx: ExperimentalAIContentContext,
): Promise<ExperimentalAIContent> {
  return {
    markdown: `# ${CITY.name}\n\n${CITY.summary}`,
    json: CITY,
    llm: {
      system: "You are a travel assistant.",
      user: `Suggest a 2-day itinerary in ${CITY.name}.`,
    },
  };
}
