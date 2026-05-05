import Link from "next/link";
import { DateSelector } from "@/components/DateSelector";
import { RepoCard } from "@/components/RepoCard";
import { SummaryPanel } from "@/components/SummaryPanel";
import { UpdateTrendingButton } from "@/components/UpdateTrendingButton";
import { prisma } from "@/lib/db";
import { computeMetrics } from "@/lib/metrics";
import type { TrendingRepoItem } from "@/types/trending";

export const dynamic = "force-dynamic";

function toMetricRepos(repos: Array<{ rank: number; owner: string; name: string; repoFullName: string; url: string; description: string | null; language: string | null; languageColor: string | null; stars: number; forks: number; starsToday: number }>): TrendingRepoItem[] {
  return repos.map((repo) => ({ ...repo }));
}

export default async function Home() {
  const [snapshot, dateRows] = await Promise.all([
    prisma.trendingSnapshot.findFirst({ orderBy: { date: "desc" }, include: { repos: { orderBy: { rank: "asc" } } } }),
    prisma.trendingSnapshot.findMany({ orderBy: { date: "desc" }, select: { date: true }, take: 20 }),
  ]);
  const dates = [...new Set(dateRows.map((row) => row.date.toISOString().slice(0, 10)))];

  if (!snapshot) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h1 className="text-4xl font-bold">GitHub Trending 智能总结</h1>
          <p className="mt-4 text-slate-600">还没有快照数据。配置 DATABASE_URL、CRON_SECRET 和 LLM 环境变量后，可以在下方输入密钥生成第一份总结。</p>
        </div>
        <div className="mt-6">
          <UpdateTrendingButton />
        </div>
      </main>
    );
  }

  const metrics = computeMetrics(toMetricRepos(snapshot.repos));

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">{snapshot.date.toISOString().slice(0, 10)} · {snapshot.language}/{snapshot.since}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">GitHub Trending 智能总结</h1>
          <p className="mt-3 text-slate-600">自动抓取、中文总结和趋势可视化，面向 Vercel 部署。</p>
        </div>
        <nav className="flex gap-3">
          <Link className="rounded-full bg-slate-950 px-5 py-2 text-white" href="/dashboard">仪表盘</Link>
          <Link className="rounded-full border border-slate-200 bg-white px-5 py-2" href={`/trending/${snapshot.date.toISOString().slice(0, 10)}`}>日期详情</Link>
        </nav>
      </header>

      <DateSelector dates={dates} />
      <UpdateTrendingButton />
      <SummaryPanel summary={snapshot.summary} metrics={metrics} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Trending 仓库</h2>
        <div className="space-y-4">
          {snapshot.repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
        </div>
      </section>
    </main>
  );
}
