"use client";

import { useState } from "react";
import type { InterviewData } from "./calendar-view";
import { EventCard } from "./event-card";

/** Compara apenas ano/mês/dia no fuso local (evita deslocamento UTC). */
function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface WeekViewProps {
  interviews: InterviewData[];
  date: Date;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

const TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-violet-500",
  PHONE: "bg-sky-500",
  IN_PERSON: "bg-emerald-500",
  TECHNICAL: "bg-amber-500",
};

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    return nd;
  });
}

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function WeekView({ interviews, date }: WeekViewProps) {
  const [selectedInterview, setSelectedInterview] = useState<InterviewData | null>(null);
  const weekDays = getWeekDays(date);
  const today = new Date();

  function getInterviewAt(day: Date, hour: number) {
    return interviews.find((i) => {
      const d = new Date(i.scheduledAt);
      return isSameLocalDay(d, day) && d.getHours() === hour;
    });
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-border">
          <div />
          {weekDays.map((d, i) => {
            const isToday = isSameLocalDay(d, today);
            return (
              <div
                key={i}
                className={`px-2 py-2 text-center border-l border-border ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <p className="text-[10px] text-muted-foreground">{WEEKDAY_LABELS[i]}</p>
                <p className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="space-y-0">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-border">
              <div className="px-2 py-2 text-right border-r border-border">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
              {weekDays.map((d, i) => {
                const interview = getInterviewAt(d, hour);
                const isToday = isSameLocalDay(d, today);

                return (
                  <div
                    key={i}
                    className={`border-l border-border px-1 py-1 min-h-[2.5rem] ${
                      isToday ? "bg-primary/5" : ""
                    }`}
                  >
                    {interview && (
                      <button
                        onClick={() => setSelectedInterview(interview)}
                        className={`w-full rounded px-1.5 py-1 text-left text-white text-[10px] font-medium shadow-sm truncate ${
                          TYPE_COLORS[interview.type] || "bg-slate-500"
                        }`}
                      >
                        {interview.candidate.name.split(" ")[0]}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedInterview && (
        <EventCard
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}
