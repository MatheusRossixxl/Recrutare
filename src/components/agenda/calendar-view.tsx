"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";

export type InterviewData = {
  id: string;
  scheduledAt: string;
  type: string;
  meetingLink?: string | null;
  notes?: string | null;
  status: string;
  reminderMinutes?: number | null;
  candidate: { id: string; name: string; email: string; city?: string | null };
  job: { id: string; title: string };
  interviewer: { name: string };
};

interface CalendarViewProps {
  interviews: InterviewData[];
  initialDate?: string;
  initialView?: "day" | "week" | "month";
}

export function CalendarView({ interviews, initialDate, initialView }: CalendarViewProps) {
  const [view, setView] = useState<"day" | "week" | "month">(initialView || "week");
  const [currentDate, setCurrentDate] = useState(() => {
    // "YYYY-MM-DD" sozinho é interpretado como UTC; meio-dia evita
    // deslocar o dia no fuso local.
    if (initialDate) return new Date(`${initialDate}T12:00:00`);
    return new Date();
  });

  function navigate(direction: -1 | 1) {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + direction);
    else if (view === "week") d.setDate(d.getDate() + direction * 7);
    else d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function formatDateHeader() {
    const opts: Intl.DateTimeFormatOptions =
      view === "day"
        ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
        : view === "week"
        ? { day: "numeric", month: "long", year: "numeric" }
        : { month: "long", year: "numeric" };
    return currentDate.toLocaleDateString("pt-BR", opts);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
            Hoje
          </Button>
          <h3 className="ml-2 text-sm font-semibold text-foreground capitalize">
            {formatDateHeader()}
          </h3>
        </div>

        <div className="flex rounded-lg border border-border">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {/* View */}
      {view === "day" && <DayView interviews={interviews} date={currentDate} />}
      {view === "week" && <WeekView interviews={interviews} date={currentDate} />}
      {view === "month" && (
        <MonthView
          interviews={interviews}
          date={currentDate}
          onDayClick={(d) => {
            setCurrentDate(d);
            setView("day");
          }}
        />
      )}
    </div>
  );
}
