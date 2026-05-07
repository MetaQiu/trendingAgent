import Link from "next/link";
import { DateSelector } from "@/components/DateSelector";
import { FloatingBackToLeaderboard } from "@/components/FloatingBackToLeaderboard";
import { RepoCard } from "@/components/RepoCard";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TopRepositoriesLeaderboard } from "@/components/TopRepositoriesLeaderboard";
import { TrendingTable } from "@/components/TrendingTable";
import { parseDateKey } from "@/lib/date";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TrendingDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const [snapshot, dateRows] = await Promise.all([
    prisma.trendingSnapshot.findUnique({
      where: { date_language_since: { date: parseDateKey(date), language: "all", since: "daily" } },
      include: { repos: { orderBy: { rank: "asc" } } },
    }),
    prisma.trendingSnapshot.findMany({ orderBy: { date: "desc" }, select: { date: true }, take: 20 }),
  ]);
  const dates = [...new Set(dateRows.map((row) => row.date.toISOString().slice(0, 10)))];

  if (!snapshot) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">{date} 暂无快照</h1>
        <Link className="mt-6 inline-block rounded-full bg-slate-950 px-5 py-2 text-white" href="/">返回首页</Link>
      </main>
    );
  }

  return (
    <main className="lp-shell space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="lp-eyebrow">{snapshot.language}/{snapshot.since}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight lp-ink">{date} Trending 快照</h1>
        </div>
        <nav className="flex flex-wrap gap-3">
          <a className="lp-chip px-5 py-2 font-semibold hover:text-[var(--accent)]" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">GitHub</a>
          <Link className="lp-chip px-5 py-2 font-semibold" href="/">返回首页</Link>
        </nav>
      </header>

      <DateSelector dates={dates} currentDate={date} />
      <TopRepositoriesLeaderboard repos={snapshot.repos} />
      <SummaryPanel summary={snapshot.summary} />
      <TrendingTable repos={snapshot.repos} />
      <section className="space-y-4">
        <div>
          <p className="lp-eyebrow">Details</p>
          <h2 className="mt-1 text-xl font-semibold lp-ink">仓库详情</h2>
        </div>
        {snapshot.repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
      </section>
      <FloatingBackToLeaderboard />
    </main>
  );
}
