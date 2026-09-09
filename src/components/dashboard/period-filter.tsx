"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const PERIODS = [
  { value: "1", label: "Mês atual" },
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
] as const;

interface PeriodFilterProps {
  currentPeriod: string;
}

export function PeriodFilter({ currentPeriod }: PeriodFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "1") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => handlePeriodChange(p.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            currentPeriod === p.value
              ? "bg-neutral-950 text-white shadow-sm"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          )}
          aria-pressed={currentPeriod === p.value}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
