export default function Page() {
  return (
    <div className="border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        Static Route
      </p>
      <h2 className="mt-2 text-xl font-semibold">Houses in NYC</h2>
      <p className="mt-2 text-sm text-slate-600">
        This page wins over the hybrid route because it is fully static.
      </p>
    </div>
  );
}
