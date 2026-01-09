import { notFound } from "next/navigation";
import type { ExperimentalAIContent, ExperimentalAIContentContext } from "next";

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

export const experimentalAIFormats = ["markdown", "json", "llm"] as const;

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
    <article>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>{city.name}</h1>
      <p style={{ fontSize: 18, marginBottom: 20 }}>{city.summary}</p>
      <p style={{ color: "#374151", lineHeight: 1.6 }}>{city.description}</p>
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Highlights</h2>
        <ul>
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
    throw new Error(`Unknown city: ${slug}`);
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
  };
}

export async function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({ slug }));
}
