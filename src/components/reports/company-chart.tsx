"use client";

const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4"];

interface CompanyChartProps {
  data: { name: string; value: number }[];
}

export function CompanyChart({ data }: CompanyChartProps) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem vagas cadastradas.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
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
                  backgroundColor: COLORS[i % COLORS.length],
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
