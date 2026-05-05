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
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600">{snapshot.date.toISOString().slice(0, 10)}</p>
          <h1 className="text-3xl font-bold">趋势仪表盘</h1>
        </div>
        <nav className="flex flex-wrap gap-3">
          <a className="rounded-full border border-slate-900 bg-slate-950 px-5 py-2 font-medium text-white shadow-sm hover:bg-slate-800" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">GitHub</a>
          <Link className="rounded-full border border-slate-200 bg-white px-5 py-2" href="/">返回首页</Link>
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
        <h2 className="text-2xl font-semibold">推荐项目</h2>
        {recommendations.length > 0 ? recommendations.map((repo) => <RepoCard key={repo.id} repo={repo} />) : <p className="text-slate-500">暂无推荐项目。</p>}
      </section>
    </main>
  );
}
