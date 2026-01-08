export default async function HybridLayout({ params, children }) {
  const { location } = await params;
  return (
    <section className="border border-slate-300 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        Hybrid Layout
      </div>
      <div className="mt-1 text-sm text-slate-600">Location: {location}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
