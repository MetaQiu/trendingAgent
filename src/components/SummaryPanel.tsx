import type { TrendingMetrics } from "@/types/trending";

export function SummaryPanel({ summary, metrics }: { summary: string; metrics: TrendingMetrics }) {
  const cards = [
    ["仓库数量", metrics.repoCount.toString()],
    ["今日新增 Stars", metrics.totalStarsToday.toLocaleString()],
    ["最热门语言", metrics.hottestLanguage || "暂无"],
    ["新增 Stars 最高", metrics.highestStarsTodayRepo || "暂无"],
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">今日中文总结</h2>
        <p className="leading-8 text-slate-700">{summary}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 break-words text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
