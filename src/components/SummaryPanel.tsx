export function SummaryPanel({ summary }: { summary: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold">今日中文总结</h2>
      <p className="leading-8 text-slate-700">{summary}</p>
    </section>
  );
}
