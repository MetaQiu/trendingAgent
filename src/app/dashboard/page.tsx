import Link from "next/link";
import { LanguageChart } from "@/components/LanguageChart";
import { RepoCard } from "@/components/RepoCard";
import { StarsChart } from "@/components/StarsChart";
import { prisma } from "@/lib/db";
import { computeMetrics } from "@/lib/metrics";
import type { TrendingRepoItem } from "@/types/trending";

export const dynamic = "force-dynamic";

function toMetricRepos(repos: Array<{ rank: number; owner: string; name: string; repoFullName: string; url: string; description: string | null; language: string | null; languageColor: string | null; stars: number; forks: number; starsToday: number }>): TrendingRepoItem[] {
  return repos.map((repo) => ({ ...repo }));
}

export default async function DashboardPage() {
  const snapshot = await prisma.trendingSnapshot.findFirst({ orderBy: { date: "desc" }, include: { repos: { orderBy: { rank: "asc" } } } });

  if (!snapshot) {
    return <main className="mx-auto max-w-5xl px-6 py-16 text-center">暂无数据</main>;
  }

  const metrics = computeMetrics(toMetricRepos(snapshot.repos));
  const recommendations = snapshot.repos.filter((repo) => repo.recommendationReason).slice(0, 5);

  return (
    <main className="lp-shell space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="lp-eyebrow">{snapshot.date.toISOString().slice(0, 10)}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight lp-ink">趋势仪表盘</h1>
        </div>
        <nav className="flex flex-wrap gap-3">
          <a className="lp-chip px-5 py-2 font-semibold hover:text-[var(--accent)]" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">GitHub</a>
          <Link className="lp-chip px-5 py-2 font-semibold" href="/">返回首页</Link>
        </nav>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <LanguageChart data={metrics.languageDistribution} />
        <StarsChart title="今日新增 Stars Top 10" data={metrics.starsTodayTop} dataKey="starsToday" />
        <div className="lg:col-span-2">
          <StarsChart title="总 Stars Top 10" data={metrics.totalStarsTop} dataKey="stars" />
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <p className="lp-eyebrow">Recommended</p>
          <h2 className="mt-1 text-xl font-semibold lp-ink">推荐项目</h2>
        </div>
        {recommendations.length > 0 ? recommendations.map((repo) => <RepoCard key={repo.id} repo={repo} />) : <p className="text-slate-500">暂无推荐项目。</p>}
      </section>
    </main>
  );
}
