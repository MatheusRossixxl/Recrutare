"use client";

const COLOR_MAP: Record<string, string> = {
  "bg-slate-400": "#94a3b8",
  "bg-sky-400": "#38bdf8",
  "bg-teal-400": "#2dd4bf",
  "bg-violet-500": "#8b5cf6",
  "bg-indigo-500": "#6366f1",
  "bg-cyan-500": "#06b6d4",
  "bg-lime-500": "#84cc16",
  "bg-amber-500": "#f59e0b",
  "bg-emerald-500": "#10b981",
  "bg-rose-400": "#fb7185",
  "bg-rose-600": "#e11d48",
  "bg-orange-400": "#fb923c",
};

interface ReportsStageChartProps {
  data: { name: string; value: number; color: string }[];
}

export function ReportsStageChart({ data }: ReportsStageChartProps) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem candidatos no pipeline.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        const hex = COLOR_MAP[d.color] ?? "#6366f1";
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{d.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{d.value}</span>
                <span className="text-[10px] text-muted-foreground">{pct}%</span>
              </div>
            </div>
            <div className="h-6 overflow-hidden rounded-lg bg-muted">
              <div
                className="flex h-full items-center rounded-lg transition-all duration-500"
                style={{
                  width: `${(d.value / maxVal) * 100}%`,
                  backgroundColor: hex,
                  minWidth: d.value > 0 ? 6 : 0,
                }}
              >
                {pct >= 8 && (
                  <span className="px-2 text-[10px] font-bold text-white drop-shadow-sm">
                    {pct}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
