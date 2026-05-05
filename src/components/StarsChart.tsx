"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function StarsChart({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: Array<{ repoFullName: string } & Record<string, number | string>>;
  dataKey: string;
}) {
  return (
    <div className="h-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="repoFullName" width={140} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#16a34a" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
