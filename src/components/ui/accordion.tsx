"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

interface AccordionProps {
  trigger: ReactNode;
  count?: number;
  color?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function Accordion({
  trigger,
  count,
  color,
  defaultOpen = false,
  children,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className={cn(
        "group rounded-xl border border-border bg-card",
        className
      )}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 select-none list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2.5">
          {color && (
            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", color)} />
          )}
          <span className="text-sm font-semibold">{trigger}</span>
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {count}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-border px-4 py-3">{children}</div>
    </details>
  );
}
