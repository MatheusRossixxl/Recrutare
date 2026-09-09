"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const RANGES = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "custom", label: "Personalizado" },
] as const;

interface DateRangeFilterProps {
  currentRange: string;
  currentFrom?: string;
  currentTo?: string;
}

export function DateRangeFilter({
  currentRange,
  currentFrom,
  currentTo,
}: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCustom, setShowCustom] = useState(currentRange === "custom");
  const [from, setFrom] = useState(currentFrom ?? "");
  const [to, setTo] = useState(currentTo ?? "");

  const handleRangeChange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range === "30") {
      params.delete("range");
      params.delete("from");
      params.delete("to");
    } else {
      params.set("range", range);
    }
    setShowCustom(range === "custom");
    router.push(`/reports?${params.toString()}`);
  };

  const handleCustomApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRangeChange(r.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              currentRange === r.value
                ? "bg-neutral-950 text-white shadow-sm"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            )}
            aria-pressed={currentRange === r.value}
          >
            {r.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 shadow-sm">
            <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-transparent text-xs text-neutral-700 outline-none"
              aria-label="Data inicial"
            />
          </div>
          <span className="text-xs text-neutral-400">até</span>
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 shadow-sm">
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-transparent text-xs text-neutral-700 outline-none"
              aria-label="Data final"
            />
          </div>
          <Button
            size="sm"
            onClick={handleCustomApply}
            className="h-8 rounded-lg bg-neutral-950 px-3 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}
