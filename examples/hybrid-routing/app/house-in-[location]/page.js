export default async function Page({ params }) {
  const { location } = await params;
  return (
    <div className="border border-slate-200 p-4">
      <h3 className="text-lg font-semibold">Houses in {location}</h3>
      <p className="mt-2 text-sm text-slate-600">
        Matched by <span className="font-mono">/house-in-[location]</span>.
      </p>
    </div>
  );
}
