import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { CalendarDays, Link2, Unlink, Plus, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarView } from "@/components/agenda/calendar-view";
import { SyncButton } from "@/components/agenda/sync-button";
import Link from "next/link";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { date?: string; view?: string };
}) {
  const user = await requireSession();

  const googleConnected = !!(user as any).googleAccessToken;

  // Agenda pessoal do entrevistador dentro da própria organização:
  // só entrevistas onde o usuário logado é o entrevistador E pertence
  // à mesma organizationId (isolamento multi-tenant preservado).
  const interviews = await db.interview.findMany({
    where: {
      organizationId: user.organizationId,
      interviewerId: user.id,
      status: { in: ["SCHEDULED", "RESCHEDULED"] },
    },
    include: {
      candidate: { select: { id: true, name: true, email: true, city: true } },
      job: { select: { id: true, title: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const serializedInterviews = interviews.map((i) => ({
    id: i.id,
    scheduledAt: i.scheduledAt.toISOString(),
    type: i.type,
    meetingLink: i.meetingLink,
    notes: i.notes,
    status: i.status,
    reminderMinutes: i.reminderMinutes,
    candidate: i.candidate,
    job: i.job,
    interviewer: { name: user.name },
  }));

  return (
    <div className="animate-page space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Gestão de tempo
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Agenda
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize e gerencie suas entrevistas agendadas.
          </p>
          <div className="mt-2">
            {googleConnected ? (
              <Badge variant="success">Google Calendar conectado</Badge>
            ) : (
              <Badge variant="default">Google Calendar desconectado</Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {googleConnected ? (
            <>
              <SyncButton />
              <form action="/api/google/disconnect" method="POST">
                <Button variant="outline" size="sm" type="submit" className="gap-1.5">
                  <Unlink className="h-3.5 w-3.5" />
                  Desconectar Google
                </Button>
              </form>
            </>
          ) : (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href="/api/google/auth">
                <Link2 className="h-3.5 w-3.5" />
                Conectar Google Calendar
              </a>
            </Button>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href="/interviews">Ver lista</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/interviews/new">
              <Plus className="h-3.5 w-3.5" />
              Agendar
            </Link>
          </Button>
        </div>
      </div>

      {/* CALENDAR */}
      {serializedInterviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma entrevista na agenda."
          description="Agende uma entrevista para vê-la aqui nos modos dia, semana e mês."
          action={
            <Button asChild size="sm">
              <Link href="/interviews/new">
                <CalendarClock className="h-4 w-4" />
                Agendar entrevista
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <CalendarView
            interviews={serializedInterviews}
            initialDate={searchParams.date}
            initialView={searchParams.view as "day" | "week" | "month"}
          />
        </div>
      )}
    </div>
  );
}
