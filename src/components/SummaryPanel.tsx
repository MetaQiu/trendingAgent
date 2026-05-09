import { messages, type Locale } from "@/lib/i18n";

export function SummaryPanel({ summary, locale }: { summary: string; locale: Locale }) {
  const t = messages[locale].summaryPanel;
  return (
    <section className="lp-card p-6">
      <p className="lp-eyebrow">{t.eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold lp-ink">{t.title}</h2>
      <p className="mt-4 max-w-4xl leading-8 lp-muted">{summary}</p>
    </section>
  );
}
