export function SummaryPanel({ summary }: { summary: string }) {
  return (
    <section className="lp-card p-6">
      <p className="lp-eyebrow">Daily Brief</p>
      <h2 className="mt-2 text-xl font-semibold lp-ink">今日中文总结</h2>
      <p className="mt-4 max-w-4xl leading-8 lp-muted">{summary}</p>
    </section>
  );
}
