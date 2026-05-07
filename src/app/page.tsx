import Link from "next/link";
import { DateSelector } from "@/components/DateSelector";
import { LanguageChart } from "@/components/LanguageChart";
import { NextTrendingCountdown } from "@/components/NextTrendingCountdown";
import { RepoCard } from "@/components/RepoCard";
import { StarsChart } from "@/components/StarsChart";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TopRepositoriesLeaderboard } from "@/components/TopRepositoriesLeaderboard";
import { TrendingUpdateRunsPanel, type TrendingUpdateRunListItem } from "@/components/TrendingUpdateRunsPanel";
import { UpdateTrendingButton } from "@/components/UpdateTrendingButton";
import { prisma } from "@/lib/db";
import { computeMetrics } from "@/lib/metrics";
import type { TrendingRepoItem } from "@/types/trending";

export const dynamic = "force-dynamic";

function toMetricRepos(repos: Array<{ rank: number; owner: string; name: string; repoFullName: string; url: string; description: string | null; language: string | null; languageColor: string | null; stars: number; forks: number; starsToday: number }>): TrendingRepoItem[] {
  return repos.map((repo) => ({ ...repo }));
}

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
  const metrics = snapshot ? computeMetrics(toMetricRepos(snapshot.repos)) : null;

  if (!snapshot) {
    return (
      <main className="lp-shell">
        <div className="lp-card p-10 text-center">
          <div className="flex justify-end">
            <a className="lp-chip px-5 py-2 font-semibold hover:text-[var(--accent)]" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <p className="lp-eyebrow mt-6">TrendingAgent</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight lp-ink">GitHub Trending 智能总结</h1>
          <p className="mx-auto mt-4 max-w-2xl lp-muted">还没有快照数据。配置 DATABASE_URL、CRON_SECRET 和 LLM 环境变量后，可以在下方输入密钥生成第一份总结。</p>
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
    <main className="lp-shell space-y-6">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="lp-eyebrow">TrendingAgent</p>
          <h1 className="mt-2 text-[clamp(32px,4vw,52px)] font-bold leading-tight tracking-tight lp-ink">GitHub Trending 智能总结</h1>
          <p className="mt-3 max-w-xl lp-muted">自动抓取、中文总结和趋势可视化。</p>
        </div>
        <nav className="flex flex-wrap items-center gap-3">
          <span className="lp-chip inline-flex items-baseline gap-2 px-4 py-2 font-mono text-sm">
            <span className="text-[11px] uppercase tracking-[0.16em] lp-muted">Observed</span>
            <strong>{snapshot.date.toISOString().slice(0, 10)}</strong>
          </span>
          <a className="lp-chip px-5 py-2 font-semibold hover:text-[var(--accent)]" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">GitHub</a>
          <Link className="lp-chip px-5 py-2 font-semibold" href={`/trending/${snapshot.date.toISOString().slice(0, 10)}`}>日期详情</Link>
        </nav>
      </header>

      <DateSelector dates={dates} currentDate={snapshot.date.toISOString().slice(0, 10)} />
      <TopRepositoriesLeaderboard repos={snapshot.repos} />
      {metrics ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <LanguageChart data={metrics.languageDistribution} />
          <StarsChart title="今日新增 Stars Top 10" data={metrics.starsTodayTop} dataKey="starsToday" />
          <div className="lg:col-span-2">
            <StarsChart title="总 Stars Top 10" data={metrics.totalStarsTop} dataKey="stars" />
          </div>
        </section>
      ) : null}
      <SummaryPanel summary={snapshot.summary} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <UpdateTrendingButton />
        <NextTrendingCountdown />
      </div>
      <TrendingUpdateRunsPanel runs={runs} />

      <section className="space-y-4">
        <div>
          <p className="lp-eyebrow">Repositories</p>
          <h2 className="mt-1 text-xl font-semibold lp-ink">Trending 仓库</h2>
        </div>
        <div className="space-y-4">
          {snapshot.repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
        </div>
      </section>
    </main>
  );
}
