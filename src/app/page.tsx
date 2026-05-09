import { DateSelector } from "@/components/DateSelector";
import { parseDateKey } from "@/lib/date";
import { LanguageChart } from "@/components/LanguageChart";
import { RepoCard } from "@/components/RepoCard";
import { SideNavigation } from "@/components/SideNavigation";
import { StarsChart } from "@/components/StarsChart";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TopRepositoriesLeaderboard } from "@/components/TopRepositoriesLeaderboard";
import { TopUtilityMenu } from "@/components/TopUtilityMenu";
import type { TrendingUpdateRunListItem } from "@/components/TrendingUpdateRunsPanel";
import { prisma } from "@/lib/db";
import { computeMetrics } from "@/lib/metrics";
import type { TrendingRepoItem } from "@/types/trending";

export const dynamic = "force-dynamic";

function toMetricRepos(repos: Array<{ rank: number; owner: string; name: string; repoFullName: string; url: string; description: string | null; language: string | null; languageColor: string | null; stars: number; forks: number; starsToday: number }>): TrendingRepoItem[] {
  return repos.map((repo) => ({ ...repo }));
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.86.09-.66.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.9c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9v2.83c0 .28.18.6.69.5A10.04 10.04 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const requestedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  const snapshotQuery = requestedDate
    ? prisma.trendingSnapshot.findUnique({
        where: { date_language_since: { date: parseDateKey(requestedDate), language: "all", since: "daily" } },
        include: { repos: { orderBy: { rank: "asc" } } },
      })
    : prisma.trendingSnapshot.findFirst({ orderBy: { date: "desc" }, include: { repos: { orderBy: { rank: "asc" } } } });
  const [snapshot, dateRows, runRows] = await Promise.all([
    snapshotQuery,
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
          <div className="relative z-[70] flex flex-wrap justify-end gap-2">
            <TopUtilityMenu runs={runs} />
            <a
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="https://github.com/MetaQiu/trendingAgent"
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              aria-label="打开 GitHub 仓库"
            >
              <GitHubIcon />
            </a>
          </div>
          <p className="lp-eyebrow mt-6">TrendingAgent</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight lp-ink">GitHub Trending 智能总结</h1>
          <p className="mx-auto mt-4 max-w-2xl lp-muted">还没有快照数据。配置 DATABASE_URL、CRON_SECRET 和 LLM 环境变量后，可以在下方输入密钥生成第一份总结。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="lp-shell space-y-6">
      <SideNavigation />
      <header className="relative z-[70] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <p className="lp-eyebrow">TrendingAgent</p>
          <h1 className="mt-2 whitespace-nowrap text-[clamp(28px,4vw,52px)] font-bold leading-tight tracking-tight lp-ink">GitHub Trending 智能总结</h1>
          <p className="mt-3 max-w-xl lp-muted">自动抓取、中文总结和趋势可视化。</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-11 items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 font-mono text-sm shadow-sm backdrop-blur">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] lp-muted">Observed</span>
            <strong className="lp-ink">{snapshot.date.toISOString().slice(0, 10)}</strong>
          </span>
          <TopUtilityMenu runs={runs} />
          <a
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href="https://github.com/MetaQiu/trendingAgent"
            target="_blank"
            rel="noreferrer"
            title="GitHub"
            aria-label="打开 GitHub 仓库"
          >
            <GitHubIcon />
          </a>
        </nav>
      </header>

      <DateSelector dates={dates} currentDate={snapshot.date.toISOString().slice(0, 10)} />
      <TopRepositoriesLeaderboard repos={snapshot.repos} />
      {metrics ? (
        <section id="charts" className="grid scroll-mt-8 gap-6 lg:grid-cols-2">
          <LanguageChart data={metrics.languageDistribution} />
          <StarsChart title="今日新增 Stars Top 10" data={metrics.starsTodayTop} dataKey="starsToday" />
          <div className="lg:col-span-2">
            <StarsChart title="总 Stars Top 10" data={metrics.totalStarsTop} dataKey="stars" />
          </div>
        </section>
      ) : null}
      <div id="summary" className="scroll-mt-8">
        <SummaryPanel summary={snapshot.summary} />
      </div>

      <section id="repo-details" className="scroll-mt-8 space-y-4">
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
