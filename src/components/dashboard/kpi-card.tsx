import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

export function KpiCard({ label, value, icon: Icon, href, trend }: KpiCardProps) {
  return (
    <Link href={href} className="group">
      <Card
        className="hover-lift h-full rounded-2xl border-neutral-200 bg-white shadow-sm transition-colors group-hover:border-neutral-300"
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>

            {trend && (
              <div
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                  trend.direction === "up"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-medium text-neutral-500">{label}</p>
            <p className="text-tabular mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              {value}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
