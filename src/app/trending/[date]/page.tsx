import Link from "next/link";
import { RepoCard } from "@/components/RepoCard";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TrendingTable } from "@/components/TrendingTable";
import { parseDateKey } from "@/lib/date";
import { prisma } from "@/lib/db";
import { computeMetrics } from "@/lib/metrics";
import type { TrendingRepoItem } from "@/types/trending";

export const dynamic = "force-dynamic";

function toMetricRepos(repos: Array<{ rank: number; owner: string; name: string; repoFullName: string; url: string; description: string | null; language: string | null; languageColor: string | null; stars: number; forks: number; starsToday: number }>): TrendingRepoItem[] {
  return repos.map((repo) => ({ ...repo }));
}

export default async function TrendingDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const snapshot = await prisma.trendingSnapshot.findUnique({
    where: { date_language_since: { date: parseDateKey(date), language: "all", since: "daily" } },
    include: { repos: { orderBy: { rank: "asc" } } },
  });

  if (!snapshot) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">{date} 暂无快照</h1>
        <Link className="mt-6 inline-block rounded-full bg-slate-950 px-5 py-2 text-white" href="/">返回首页</Link>
      </main>
    );
  }

  const metrics = computeMetrics(toMetricRepos(snapshot.repos));

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600">{snapshot.language}/{snapshot.since}</p>
          <h1 className="text-3xl font-bold">{date} Trending 快照</h1>
        </div>
        <Link className="rounded-full border border-slate-200 bg-white px-5 py-2" href="/">返回首页</Link>
      </header>

      <SummaryPanel summary={snapshot.summary} metrics={metrics} />
      <TrendingTable repos={snapshot.repos} />
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">仓库详情</h2>
        {snapshot.repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
      </section>
    </main>
  );
}
