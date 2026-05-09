"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { messages, type Locale } from "@/lib/i18n";

export function StarsChart({
  title,
  data,
  dataKey,
  locale,
}: {
  title: string;
  data: Array<{ repoFullName: string } & Record<string, number | string>>;
  dataKey: string;
  locale: Locale;
}) {
  const t = messages[locale].charts;
  return (
    <div className="lp-card h-96 p-5">
      <p className="lp-eyebrow">{t.rankingEyebrow}</p>
      <h2 className="mt-2 mb-4 text-lg font-semibold lp-ink">{title}</h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: "var(--ink-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis type="category" dataKey="repoFullName" width={140} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow)" }} />
          <Bar dataKey={dataKey} fill="var(--accent)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
