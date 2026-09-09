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

interface DayViewProps {
  interviews: InterviewData[];
  date: Date;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 - 23:00

const TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-violet-500",
  PHONE: "bg-sky-500",
  IN_PERSON: "bg-emerald-500",
  TECHNICAL: "bg-amber-500",
};

export function DayView({ interviews, date }: DayViewProps) {
  const [selectedInterview, setSelectedInterview] = useState<InterviewData | null>(null);

  const dayInterviews = interviews.filter((i) => {
    return isSameLocalDay(new Date(i.scheduledAt), date);
  });

  function getInterviewAtHour(hour: number) {
    return dayInterviews.find((i) => {
      const h = new Date(i.scheduledAt).getHours();
      return h === hour;
    });
  }

  const isToday = isSameLocalDay(date, new Date());

  return (
    <div className="relative">
      <div className="space-y-0 border border-border rounded-lg overflow-hidden">
        {HOURS.map((hour) => {
          const interview = getInterviewAtHour(hour);
          const now = new Date();
          const currentHour = now.getHours();
          const currentMin = now.getMinutes();
          const isCurrentHour = isToday && hour === currentHour;

          return (
            <div
              key={hour}
              className={`flex border-b border-border last:border-b-0 ${
                isCurrentHour ? "bg-primary/5" : ""
              }`}
            >
              {/* Time label */}
              <div className="w-16 shrink-0 border-r border-border px-2 py-3 text-right">
                <span className={`text-xs tabular-nums ${isCurrentHour ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-[3.5rem] px-3 py-2">
                {interview ? (
                  <button
                    onClick={() => setSelectedInterview(interview)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-white shadow-sm transition hover:shadow-md ${
                      TYPE_COLORS[interview.type] || "bg-slate-500"
                    }`}
                  >
                    <p className="text-xs font-semibold truncate">
                      {interview.candidate.name.split(" ")[0]}
                    </p>
                    <p className="text-[10px] opacity-90 truncate">
                      {interview.job.title}
                    </p>
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
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
