import Link from "next/link";

const items = [
  {
    slug: "sevilla",
    title: "Sevilla",
    summary: "Sunny city with historic neighborhoods and great food.",
  },
  {
    slug: "madrid",
    title: "Madrid",
    summary: "Capital city with museums, nightlife, and parks.",
  },
  {
    slug: "barcelona",
    title: "Barcelona",
    summary: "Modernist architecture, beaches, and vibrant streets.",
  },
];

const hybridItems = [
  {
    destination: "paris",
    label: "Trip to Paris",
  },
  {
    destination: "tokyo",
    label: "Trip to Tokyo",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">
          Destinations (Standard Dynamic)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Select a destination to view its content or request a specific format.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.slug}
              className="border border-slate-200 p-4 rounded-lg hover:border-slate-300 transition-colors"
            >
              <Link
                href={`/ai/${item.slug}`}
                className="text-lg font-semibold text-slate-900 hover:underline"
              >
                {item.title}
              </Link>
              <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
              <div className="mt-3 flex gap-2 text-xs font-medium text-slate-500">
                <a
                  href={`/ai/${item.slug}.md`}
                  className="hover:text-slate-700"
                >
                  .md
                </a>
                <a
                  href={`/ai/${item.slug}.json`}
                  className="hover:text-slate-700"
                >
                  .json
                </a>
                <a
                  href={`/ai/${item.slug}.llm`}
                  className="hover:text-slate-700"
                >
                  .llm
                </a>
                <a
                  href={`/ai/${item.slug}.txt`}
                  className="hover:text-slate-700"
                >
                  .txt
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hybrid Routes</h2>
        <p className="mt-2 text-sm text-slate-600">
          Example of hybrid route segments with AI content support.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {hybridItems.map((item) => (
            <div
              key={item.destination}
              className="border border-slate-200 p-4 rounded-lg hover:border-slate-300 transition-colors"
            >
              <Link
                href={`/trip-to-${item.destination}`}
                className="text-lg font-semibold text-slate-900 hover:underline"
              >
                {item.label}
              </Link>
              <p className="mt-1 text-sm text-slate-600">
                Matched by /trip-to-[destination]
              </p>
              <div className="mt-3 flex gap-2 text-xs font-medium text-slate-500">
                <a
                  href={`/trip-to-${item.destination}.md`}
                  className="hover:text-slate-700"
                >
                  .md
                </a>
                <a
                  href={`/trip-to-${item.destination}.json`}
                  className="hover:text-slate-700"
                >
                  .json
                </a>
                <a
                  href={`/trip-to-${item.destination}.txt`}
                  className="hover:text-slate-700"
                >
                  .txt
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Minimal Example</h2>
        <p className="mt-2 text-sm text-slate-600">
          A very concise example of AI content negotiation using a static route.
        </p>
        <div className="mt-4">
          <div className="border border-slate-200 p-4 rounded-lg hover:border-slate-300 transition-colors max-w-sm">
            <Link
              href="/paris"
              className="text-lg font-semibold text-slate-900 hover:underline"
            >
              Paris (Minimal)
            </Link>
            <div className="mt-3 flex gap-2 text-xs font-medium text-slate-500">
              <a href="/paris.md" className="hover:text-slate-700">
                .md
              </a>
              <a href="/paris.json" className="hover:text-slate-700">
                .json
              </a>
              <a href="/paris.llm" className="hover:text-slate-700">
                .llm
              </a>
              <a href="/paris.txt" className="hover:text-slate-700">
                .txt
              </a>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Accept Headers</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <pre className="overflow-x-auto p-4 text-xs text-slate-700">
            {`curl -H "Accept: text/markdown" http://localhost:3000/ai/sevilla
curl -H "Accept: application/json" http://localhost:3000/ai/sevilla
curl -H "Accept: text/plain" http://localhost:3000/ai/sevilla
curl -H "Accept: application/llm+json" http://localhost:3000/ai/sevilla`}
          </pre>
        </div>
      </section>
    </div>
  );
}
