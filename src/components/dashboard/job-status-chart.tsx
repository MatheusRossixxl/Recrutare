"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#94a3b8", "#4f46e5", "#f59e0b", "#64748b", "#f43f5e"];

export function JobStatusChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma vaga cadastrada ainda.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
