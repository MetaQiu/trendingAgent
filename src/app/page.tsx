import Link from "next/link";
import { DateSelector } from "@/components/DateSelector";
import { NextTrendingCountdown } from "@/components/NextTrendingCountdown";
import { RepoCard } from "@/components/RepoCard";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TrendingUpdateRunsPanel, type TrendingUpdateRunListItem } from "@/components/TrendingUpdateRunsPanel";
import { UpdateTrendingButton } from "@/components/UpdateTrendingButton";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function toRunListItem(run: {
  id: string;
  status: string;
  trigger: string;
  dateKey: string | null;
  since: string | null;
  repoCount: number;
  snapshotCount: number;
  message: string | null;
  errorMessage: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
}): TrendingUpdateRunListItem {
  return {
    id: run.id,
    status: run.status,
    trigger: run.trigger,
    dateKey: run.dateKey,
    since: run.since,
    repoCount: run.repoCount,
    snapshotCount: run.snapshotCount,
    message: run.message,
    errorMessage: run.errorMessage,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
    durationMs: run.durationMs,
  };
}

export default async function Home() {
  const [snapshot, dateRows, runRows] = await Promise.all([
    prisma.trendingSnapshot.findFirst({ orderBy: { date: "desc" }, include: { repos: { orderBy: { rank: "asc" } } } }),
    prisma.trendingSnapshot.findMany({ orderBy: { date: "desc" }, select: { date: true }, take: 20 }),
    prisma.trendingUpdateRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
  ]);
  const dates = [...new Set(dateRows.map((row) => row.date.toISOString().slice(0, 10)))];
  const runs = runRows.map(toRunListItem);

  if (!snapshot) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="flex justify-end">
            <a className="rounded-full border border-slate-900 bg-slate-950 px-5 py-2 font-medium text-white! shadow-sm hover:bg-slate-800" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <h1 className="mt-6 text-4xl font-bold">GitHub Trending 智能总结</h1>
          <p className="mt-4 text-slate-600">还没有快照数据。配置 DATABASE_URL、CRON_SECRET 和 LLM 环境变量后，可以在下方输入密钥生成第一份总结。</p>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <UpdateTrendingButton />
          <NextTrendingCountdown />
        </div>
        <div className="mt-6">
          <TrendingUpdateRunsPanel runs={runs} />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">{snapshot.date.toISOString().slice(0, 10)} · {snapshot.language}/{snapshot.since}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">GitHub Trending 智能总结</h1>
          <p className="mt-3 text-slate-600">自动抓取、中文总结和趋势可视化，面向 Vercel 部署。</p>
        </div>
        <nav className="flex flex-wrap gap-3">
          <a className="rounded-full border border-slate-900 bg-slate-950 px-5 py-2 font-medium text-white! shadow-sm hover:bg-slate-800" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">GitHub</a>
          <Link className="rounded-full border border-emerald-200 bg-emerald-500 px-5 py-2 font-medium text-white! shadow-sm hover:bg-emerald-600" href="/dashboard">仪表盘</Link>
          <Link className="rounded-full border border-slate-200 bg-white px-5 py-2" href={`/trending/${snapshot.date.toISOString().slice(0, 10)}`}>日期详情</Link>
        </nav>
      </header>

      <DateSelector dates={dates} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <UpdateTrendingButton />
        <NextTrendingCountdown />
      </div>
      <TrendingUpdateRunsPanel runs={runs} />
      <SummaryPanel summary={snapshot.summary} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Trending 仓库</h2>
        <div className="space-y-4">
          {snapshot.repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
        </div>
      </section>
    </main>
  );
}
