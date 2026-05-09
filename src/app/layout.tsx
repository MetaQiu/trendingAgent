import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Trending Signal Intelligence",
  description: "AI-powered daily intelligence for discovering breakout open-source projects, decoding developer momentum, and mapping emerging technology trends.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="mx-auto max-w-[1180px] px-6 py-8 text-center text-sm font-medium uppercase tracking-[0.18em] lp-muted">
          MADE WITH <span className="text-[var(--accent)]">❤</span> BY{" "}
          <a className="font-semibold text-[var(--ink)] underline underline-offset-4 hover:text-[var(--accent)]" href="https://metaqiu.cn/" target="_blank" rel="noreferrer">
            METAQIU
          </a>
        </footer>
      </body>
    </html>
  );
}
