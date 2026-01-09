import type { ReactNode } from "react";

export const metadata = {
  title: "AI Content Negotiation",
  description: "Example for AI content negotiation in Next Hybrid.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          margin: 0,
          padding: 0,
          background: "#f5f5f7",
          color: "#1a1a1a",
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "48px 24px 64px",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
