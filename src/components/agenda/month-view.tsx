"use client";

import type { InterviewData } from "./calendar-view";

/** Compara apenas ano/mês/dia no fuso local (evita deslocamento UTC). */
function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface MonthViewProps {
  interviews: InterviewData[];
  date: Date;
  onDayClick: (date: Date) => void;
}

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function MonthView({ interviews, date, onDayClick }: MonthViewProps) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Monday
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startOffset);

  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const cells: Date[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push(d);
  }

  const today = new Date();

  function countInterviewsForDay(day: Date) {
    return interviews.filter((i) => {
      return isSameLocalDay(new Date(i.scheduledAt), day);
    }).length;
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const isCurrentMonth = cell.getMonth() === month;
          const isToday = isSameLocalDay(cell, today);
          const count = countInterviewsForDay(cell);

          return (
            <button
              key={i}
              onClick={() => onDayClick(cell)}
              className={`border-b border-r border-border px-2 py-3 text-left transition hover:bg-muted/50 ${
                !isCurrentMonth ? "opacity-40" : ""
              } ${isToday ? "bg-primary/5" : ""}`}
            >
              <p className={`text-sm ${isToday ? "font-bold text-primary" : "text-foreground"}`}>
                {cell.getDate()}
              </p>
              {count > 0 && (
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: Math.min(count, 4) }).map((_, j) => (
                    <span key={j} className="h-1.5 w-1.5 rounded-full bg-primary" />
                  ))}
                  {count > 4 && (
                    <span className="text-[9px] text-muted-foreground ml-0.5">+{count - 4}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
