import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { INTERVIEW_STATUS_LABELS, INTERVIEW_STATUS_VARIANT, INTERVIEW_TYPE_LABELS } from "@/lib/constants";
import { InterviewActions } from "@/components/interviews/interview-actions";

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await requireSession();
  const status = searchParams.status || "";

  const interviews = await db.interview.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status ? { status } : {}),
    },
    orderBy: { scheduledAt: "desc" },
    include: { candidate: true, job: true, interviewer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Entrevistas</h2>
          <p className="text-sm text-muted-foreground">Agendamentos e acompanhamento de entrevistas.</p>
        </div>
        <Button asChild>
          <Link href="/interviews/new">
            <Plus className="h-4 w-4" /> Novo agendamento
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="">Todos os status</option>
          {Object.entries(INTERVIEW_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>
        {status && (
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href="/interviews">Limpar</Link>
          </Button>
        )}
      </form>

      {interviews.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={status ? "Nenhuma entrevista encontrada." : "Nenhuma entrevista agendada ainda."}
          description={
            status
              ? "Tente outro filtro de status."
              : "Agende a primeira entrevista pelo botão acima ou pela página de um candidato."
          }
          action={
            !status ? (
              <Button asChild size="sm">
                <Link href="/interviews/new">Agendar entrevista</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {interviews.map((interview) => (
            <Card key={interview.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <div>
                  <Link href={`/candidates/${interview.candidateId}`} className="font-medium hover:underline">
                    {interview.candidate.name}
                  </Link>
                  <span className="text-sm text-muted-foreground"> — {interview.job.title}</span>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(interview.scheduledAt)} · {INTERVIEW_TYPE_LABELS[interview.type] ?? interview.type} · com{" "}
                    {interview.interviewer.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={INTERVIEW_STATUS_VARIANT[interview.status]}>
                    {INTERVIEW_STATUS_LABELS[interview.status] ?? interview.status}
                  </Badge>
                  <InterviewActions interviewId={interview.id} candidateName={interview.candidate.name} status={interview.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
