import Link from "next/link";

const routes = [
  {
    href: "/house-in-nyc",
    label: "Static route",
    detail: "/house-in-nyc",
    badge: "Static",
  },
  {
    href: "/house-in-sf",
    label: "Hybrid segment",
    detail: "/house-in-[location]",
    badge: "Hybrid",
  },
  {
    href: "/foo",
    label: "Dynamic segment",
    detail: "/[slug]",
    badge: "Dynamic",
  },
  {
    href: "/foo/bar",
    label: "Catch-all segment",
    detail: "/[...slug]",
    badge: "Catch-all",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold">Route Priority Map</h2>
        <p className="mt-2 text-sm text-slate-600">
          Hybrid segments sit between static and fully dynamic routes.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          {routes.map((route) => (
            <li key={route.href}>
              <Link className="underline" href={route.href}>
                {route.label}
              </Link>{" "}
              <span className="text-slate-500">({route.detail})</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        The hybrid route uses its own layout so you can see nested layout
        boundaries.
      </section>
    </div>
  );
}
