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

export default function Page() {
  return (
    <main>
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>AI Content Negotiation</h1>
      <p style={{ fontSize: 18, lineHeight: 1.5 }}>
        This example shows how a single route can return HTML by default and
        negotiate Markdown, JSON, or LLM payloads based on extension or Accept
        headers.
      </p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Destinations</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item) => (
            <li
              key={item.slug}
              style={{
                marginBottom: 16,
                padding: 16,
                borderRadius: 12,
                background: "#ffffff",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
              }}
            >
              <a
                href={`/ai/${item.slug}`}
                style={{
                  fontSize: 20,
                  color: "#111827",
                  textDecoration: "none",
                }}
              >
                {item.title}
              </a>
              <p style={{ margin: "8px 0 0", color: "#4b5563" }}>
                {item.summary}
              </p>
              <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                <a href={`/ai/${item.slug}.md`}>.md</a>
                <a href={`/ai/${item.slug}.json`}>.json</a>
                <a href={`/ai/${item.slug}.llm`}>.llm</a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Accept Headers</h2>
        <pre
          style={{
            background: "#111827",
            color: "#e5e7eb",
            padding: 16,
            borderRadius: 12,
            overflowX: "auto",
          }}
        >{`curl -H "Accept: text/markdown" http://localhost:3000/ai/sevilla
curl -H "Accept: application/json" http://localhost:3000/ai/sevilla
curl -H "Accept: application/llm+json" http://localhost:3000/ai/sevilla`}</pre>
      </section>
    </main>
  );
}
