export default async function Page({ params }) {
  const { slug } = await params;
  return (
    <div className="border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        Dynamic Route
      </p>
      <h2 className="mt-2 text-xl font-semibold">Slug: {slug}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Matched by <span className="font-mono">/[slug]</span>.
      </p>
    </div>
  );
}
