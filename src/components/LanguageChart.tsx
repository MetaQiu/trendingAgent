"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendingMetrics } from "@/types/trending";

export function LanguageChart({ data }: { data: TrendingMetrics["languageDistribution"] }) {
  return (
    <div className="lp-card h-80 p-5">
      <p className="lp-eyebrow">Languages</p>
      <h2 className="mt-2 mb-4 text-lg font-semibold lp-ink">语言分布</h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 3" />
          <XAxis dataKey="language" tick={{ fill: "var(--ink-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow)" }} />
          <Bar dataKey="count" name="仓库数量" fill="var(--accent)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
