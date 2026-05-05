import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Trending 智能总结",
  description: "每日自动抓取、总结并可视化 GitHub Trending",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-sm font-medium uppercase tracking-wide text-slate-500">
          MADE WITH <span className="text-rose-500">❤</span> BY{" "}
          <a className="font-semibold text-slate-700 underline underline-offset-4 hover:text-blue-600" href="https://metaqiu.cn/" target="_blank" rel="noreferrer">
            METAQIU
          </a>
        </footer>
      </body>
    </html>
  );
}
