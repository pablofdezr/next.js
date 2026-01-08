import "./globals.css";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-white font-sans text-slate-900">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <header className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Next.js 16 App Router
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              Hybrid Routing Showcase
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Static routes beat hybrid segments, which beat fully dynamic and
              catch-all routes.
            </p>
          </header>
          <main className="mt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
