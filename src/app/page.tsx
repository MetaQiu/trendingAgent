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
import { buildHomeHref, messages, parseLocale } from "@/lib/i18n";
import { computeMetrics } from "@/lib/metrics";
import type { TrendingRepoItem } from "@/types/trending";

export const dynamic = "force-dynamic";

type MetricRepo = {
  rank: number;
  owner: string;
  name: string;
  repoFullName: string;
  url: string;
  description: string | null;
  language: string | null;
  languageColor: string | null;
  stars: number;
  forks: number;
  starsToday: number;
};

function toMetricRepos(repos: MetricRepo[]): TrendingRepoItem[] {
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

function LanguageSwitch({ date, locale }: { date: string | null; locale: "zh" | "en" }) {
  const t = messages[locale].app;
  const targetLocale = locale === "en" ? "zh" : "en";
  return (
    <a
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 text-sm font-bold text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      href={buildHomeHref({ date, locale: targetLocale })}
      aria-label={t.languageSwitchAria}
      title={t.languageSwitchAria}
    >
      {t.languageSwitch}
    </a>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; locale?: string }>;
}) {
  const { date, locale: localeParam } = await searchParams;
  const locale = parseLocale(localeParam);
  const t = messages[locale];
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
            <LanguageSwitch date={requestedDate} locale={locale} />
            <TopUtilityMenu runs={runs} locale={locale} />
            <a
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="https://github.com/MetaQiu/trendingAgent"
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              aria-label={t.app.githubAria}
            >
              <GitHubIcon />
            </a>
          </div>
          <p className="lp-eyebrow mt-6">TrendingAgent</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight lp-ink">{t.app.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl lp-muted">{t.app.emptyDescription}</p>
        </div>
      </main>
    );
  }

  const snapshotDate = snapshot.date.toISOString().slice(0, 10);
  const displaySummary = locale === "en" ? snapshot.summaryEn || snapshot.summary : snapshot.summary;
  const displayRepos = snapshot.repos.map((repo) => ({
    ...repo,
    summary: locale === "en" ? repo.summaryEn || repo.summary : repo.summary,
    readmeSummary: locale === "en" ? repo.readmeSummaryEn || repo.readmeSummary : repo.readmeSummary,
    recommendationReason: locale === "en" ? repo.recommendationReasonEn || repo.recommendationReason : repo.recommendationReason,
  }));

  return (
    <main className="lp-shell space-y-6">
      <SideNavigation locale={locale} />
      <header className="relative z-[70] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1 pb-1">
          <p className="lp-eyebrow">TrendingAgent</p>
          <h1 className="mt-2 text-[clamp(28px,4vw,52px)] font-bold leading-tight tracking-tight lp-ink">{t.app.title}</h1>
          <p className="mt-3 max-w-xl lp-muted">{t.app.description}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <LanguageSwitch date={requestedDate} locale={locale} />
          <TopUtilityMenu runs={runs} locale={locale} />
          <a
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href="https://github.com/MetaQiu/trendingAgent"
            target="_blank"
            rel="noreferrer"
            title="GitHub"
            aria-label={t.app.githubAria}
          >
            <GitHubIcon />
          </a>
        </nav>
      </header>

      <DateSelector dates={dates} currentDate={snapshotDate} locale={locale} observedDate={snapshotDate} />
      <TopRepositoriesLeaderboard repos={displayRepos} locale={locale} />
      {metrics ? (
        <section id="charts" className="grid scroll-mt-8 gap-6 lg:grid-cols-2">
          <LanguageChart data={metrics.languageDistribution} locale={locale} />
          <StarsChart title={t.app.starsTodayTitle} data={metrics.starsTodayTop} dataKey="starsToday" locale={locale} />
          <div className="lg:col-span-2">
            <StarsChart title={t.app.totalStarsTitle} data={metrics.totalStarsTop} dataKey="stars" locale={locale} />
          </div>
        </section>
      ) : null}
      <div id="summary" className="scroll-mt-8">
        <SummaryPanel summary={displaySummary} locale={locale} />
      </div>

      <section id="repo-details" className="scroll-mt-8 space-y-4">
        <div>
          <p className="lp-eyebrow">{t.app.repositoriesEyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold lp-ink">{t.app.repositoriesTitle}</h2>
        </div>
        <div className="space-y-4">
          {displayRepos.map((repo) => <RepoCard key={repo.id} repo={repo} locale={locale} />)}
        </div>
      </section>
    </main>
  );
}
