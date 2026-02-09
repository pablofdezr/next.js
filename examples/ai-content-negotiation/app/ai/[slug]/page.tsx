import { notFound } from "next/navigation";
import type {
  ExperimentalAIContent,
  ExperimentalAIContentContext,
} from "next/experimental";

type City = {
  name: string;
  summary: string;
  description: string;
  population: number;
  highlights: string[];
  coordinates: { lat: number; lng: number };
};

const CITIES: Record<string, City> = {
  sevilla: {
    name: "Sevilla",
    summary: "Sunny city with historic neighborhoods and great food.",
    description:
      "Sevilla blends Moorish architecture with lively plazas and riverfront walks.",
    population: 687000,
    highlights: ["Real Alcazar", "Plaza de Espana", "Triana district"],
    coordinates: { lat: 37.3891, lng: -5.9845 },
  },
  madrid: {
    name: "Madrid",
    summary: "Capital city with museums, nightlife, and parks.",
    description:
      "Madrid offers world-class art museums and a mix of historic and modern neighborhoods.",
    population: 3223000,
    highlights: ["Prado Museum", "Retiro Park", "Gran Via"],
    coordinates: { lat: 40.4168, lng: -3.7038 },
  },
  barcelona: {
    name: "Barcelona",
    summary: "Modernist architecture, beaches, and vibrant streets.",
    description:
      "Barcelona is known for Gaudi architecture, coastal promenades, and tapas culture.",
    population: 1620000,
    highlights: ["Sagrada Familia", "Park Guell", "Barceloneta Beach"],
    coordinates: { lat: 41.3874, lng: 2.1686 },
  },
};

function getCity(slug: string): City | null {
  return CITIES[slug] ?? null;
}

export const revalidate = 3600;

export const experimentalAIFormats = [
  "markdown",
  "json",
  "llm",
  "text",
] as const;

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCity(slug);

  if (!city) {
    notFound();
  }

  return (
    <article className="border border-slate-200 p-6 rounded-lg">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">
        Destination
      </div>
      <h1 className="text-3xl font-semibold text-slate-900 mb-4">
        {city.name}
      </h1>
      <p className="text-lg text-slate-700 mb-6">{city.summary}</p>
      <div className="prose prose-slate max-w-none text-slate-600">
        <p className="mb-4">{city.description}</p>
        <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">
          Highlights
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          {city.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export async function experimentalGenerateAI(
  ctx: ExperimentalAIContentContext,
): Promise<ExperimentalAIContent> {
  const slugValue = ctx.params.slug;
  const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;

  if (!slug) {
    throw new Error("Missing slug param");
  }

  const city = getCity(slug);

  if (!city) {
    // throw new Error(`Unknown city: ${slug}`)
    return {
      markdown: "# Unknown city",
      json: {
        name: "Unknown city",
        slug,
        summary: "Unknown city",
        description: "Unknown city",
        population: 0,
        highlights: [],
        coordinates: { lat: 0, lng: 0 },
      },
      llm: { system: "Unknown city", user: "Unknown city" },
      text: "Unknown city",
    };
  }

  const updated = new Date().toISOString();

  return {
    markdown: `# ${city.name}

**Updated**: ${updated}

## Summary
${city.summary}

## Description
${city.description}

## Highlights
${city.highlights.map((item) => `- ${item}`).join("\n")}

## Coordinates
- Latitude: ${city.coordinates.lat}
- Longitude: ${city.coordinates.lng}
`,
    json: {
      name: city.name,
      slug,
      summary: city.summary,
      description: city.description,
      population: city.population,
      highlights: city.highlights,
      coordinates: city.coordinates,
      updated,
    },
    llm: {
      system:
        "You are a travel assistant. Provide clear, structured recommendations.",
      user: `I am planning a trip to ${city.name}.\n\nSummary: ${city.summary}\nHighlights: ${city.highlights.join(
        ", ",
      )}\n\nPlease suggest a 2-day itinerary and local tips.`,
    },
    text: `${city.name}\n\nSummary: ${city.summary}\nDescription: ${
      city.description
    }\nHighlights: ${city.highlights.join(", ")}\nCoordinates: ${
      city.coordinates.lat
    }, ${city.coordinates.lng}\nUpdated: ${updated}`,
  };
}

export async function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({ slug }));
}
