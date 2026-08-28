"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLOR_MAP: Record<string, string> = {
  "bg-slate-400": "#94a3b8",
  "bg-sky-400": "#38bdf8",
  "bg-cyan-500": "#06b6d4",
  "bg-violet-500": "#8b5cf6",
  "bg-amber-500": "#f59e0b",
  "bg-fuchsia-500": "#d946ef",
  "bg-emerald-500": "#10b981",
  "bg-rose-500": "#f43f5e",
};

export function StageChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  if (data.every((d) => d.value === 0)) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sem candidatos no pipeline ainda.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={COLOR_MAP[entry.color] ?? "#6366f1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
