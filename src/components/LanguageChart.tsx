"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendingMetrics } from "@/types/trending";

export function LanguageChart({ data }: { data: TrendingMetrics["languageDistribution"] }) {
  return (
    <div className="h-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">语言分布</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="language" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="仓库数量" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
