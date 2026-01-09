import "./globals.css";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata = {
  title: "AI Content Negotiation",
  description: "Example for AI content negotiation in Next Hybrid.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-white font-sans text-slate-900">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <header className="border-b border-slate-200 pb-4">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Next.js 16 App Router
            </div>
            <h1 className="mt-3 text-2xl font-semibold">AI Content Negotiation</h1>
            <p className="mt-2 text-sm text-slate-600">
              Negotiate Markdown, JSON, or LLM payloads based on extension or
              Accept headers.
            </p>
          </header>
          <main className="mt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
