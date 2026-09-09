"use client";

interface TrendChartProps {
  data: { month: string; vagas: number; candidatos: number; contratacoes: number }[];
}

const SERIES = [
  { key: "vagas" as const, label: "Vagas", color: "#6366f1", light: "#818cf8" },
  { key: "candidatos" as const, label: "Candidatos", color: "#0d9488", light: "#2dd4bf" },
  { key: "contratacoes" as const, label: "Contratações", color: "#d97706", light: "#fbbf24" },
];

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return `M${points[0].x},${points[0].y}`;
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados de tendência.</p>
      </div>
    );
  }

  const W = 720;
  const H = 280;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.flatMap((d) => SERIES.map((s) => d[s.key])), 1);
  const n = data.length;

  const px = (i: number) => padL + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const py = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxVal / tickCount) * i));

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-6">
        {SERIES.map((s) => {
          const lastVal = data[data.length - 1][s.key];
          const prevVal = data.length > 1 ? data[data.length - 2][s.key] : lastVal;
          const diff = prevVal > 0 ? Math.round(((lastVal - prevVal) / prevVal) * 100) : 0;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-0.5">
                <span className="text-xs font-bold" style={{ color: s.color }}>{lastVal}</span>
                {diff !== 0 && (
                  <span className={`text-[10px] font-semibold ${diff > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {diff > 0 ? "↑" : "↓"}{Math.abs(diff)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" style={{ height: 280 }}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={`grad-${s.key}`} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
              <stop offset="60%" stopColor={s.light} stopOpacity={0.06} />
              <stop offset="100%" stopColor={s.light} stopOpacity={0} />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {ticks.map((t, i) => (
          <g key={t}>
            {i > 0 && (
              <line
                x1={padL}
                y1={py(t)}
                x2={W - padR}
                y2={py(t)}
                stroke="#f1f5f9"
                strokeWidth={1}
                strokeDasharray={i === tickCount ? "0" : "4 4"}
              />
            )}
            <text x={padL - 10} y={py(t) + 4} textAnchor="end" fontSize={10} fill="#cbd5e1" fontWeight={500}>
              {t}
            </text>
          </g>
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={px(i)} y={H - 10} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight={500}>
            {d.month}
          </text>
        ))}

        {/* Areas */}
        {SERIES.map((s) => {
          const pts = data.map((d, i) => ({ x: px(i), y: py(d[s.key]) }));
          const lineD = smoothPath(pts);
          const areaD = `${lineD} L${px(n - 1)},${padT + chartH} L${px(0)},${padT + chartH} Z`;
          return <path key={`area-${s.key}`} d={areaD} fill={`url(#grad-${s.key})`} />;
        })}

        {/* Lines with glow */}
        {SERIES.map((s) => {
          const pts = data.map((d, i) => ({ x: px(i), y: py(d[s.key]) }));
          return (
            <path
              key={`line-${s.key}`}
              d={smoothPath(pts)}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              opacity={0.9}
            />
          );
        })}

        {/* Dots */}
        {SERIES.map((s) =>
          data.map((d, i) => (
            <g key={`dot-${s.key}-${i}`}>
              <circle cx={px(i)} cy={py(d[s.key])} r={6} fill="white" stroke={s.color} strokeWidth={2} opacity={0.9} />
              <circle cx={px(i)} cy={py(d[s.key])} r={2.5} fill={s.color} />
            </g>
          ))
        )}
      </svg>
    </div>
  );
}
