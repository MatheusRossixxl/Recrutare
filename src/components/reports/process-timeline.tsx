import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGE_LABELS } from "@/lib/constants";

interface ProcessTimelineProps {
  data: { stage: string; count: number }[];
}

export function ProcessTimeline({ data }: ProcessTimelineProps) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  if (data.length === 0) {
    return (
      <Card className="rounded-2xl border-neutral-200 bg-white shadow-sm">
        <CardHeader className="border-b border-neutral-100 px-6 py-5">
          <CardTitle className="text-base font-semibold text-neutral-950">
            Funil do processo
          </CardTitle>
          <p className="mt-1 text-xs text-neutral-500">
            Visualização cronológica do funil de recrutamento
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-neutral-700">
              Sem dados suficientes para exibir o funil.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-neutral-200 bg-white shadow-sm">
      <CardHeader className="border-b border-neutral-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-950">
              Funil do processo
            </CardTitle>
            <p className="mt-1 text-xs text-neutral-500">
              Quantos candidatos em cada etapa
            </p>
          </div>
          <span className="rounded-lg bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
            {data.reduce((s, d) => s + d.count, 0)} candidatos
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = Math.round((item.count / maxCount) * 100);
            const dropOff =
              index > 0 && data[index - 1].count > 0
                ? Math.round(
                    ((data[index - 1].count - item.count) /
                      data[index - 1].count) *
                      100
                  )
                : null;

            return (
              <div key={item.stage}>
                <div className="mb-1 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-neutral-800">
                    {PIPELINE_STAGE_LABELS[item.stage] ?? item.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    {dropOff !== null && dropOff > 0 && (
                      <span className="text-[10px] font-medium text-rose-500">
                        -{dropOff}%
                      </span>
                    )}
                    <span className="text-sm font-bold text-neutral-950">
                      {item.count}
                    </span>
                  </div>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
