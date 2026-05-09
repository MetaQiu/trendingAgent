"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { messages, type Locale } from "@/lib/i18n";
import type { TrendingMetrics } from "@/types/trending";

export function LanguageChart({ data, locale }: { data: TrendingMetrics["languageDistribution"]; locale: Locale }) {
  const t = messages[locale].charts;
  return (
    <div className="lp-card h-80 p-5">
      <p className="lp-eyebrow">{t.languagesEyebrow}</p>
      <h2 className="mt-2 mb-4 text-lg font-semibold lp-ink">{t.languagesTitle}</h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 3" />
          <XAxis dataKey="language" tick={{ fill: "var(--ink-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow)" }} />
          <Bar dataKey="count" name={t.repoCount} fill="var(--accent)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
