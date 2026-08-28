import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { createInterview } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarX2 } from "lucide-react";
import { INTERVIEW_TYPE_LABELS } from "@/lib/constants";

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: { candidateId?: string; jobId?: string };
}) {
  const user = await requireSession();

  const [candidates, jobs, interviewers] = await Promise.all([
    db.candidate.findMany({
      where: { organizationId: user.organizationId, archived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.job.findMany({
      where: { organizationId: user.organizationId, archived: false },
      orderBy: { title: "asc" },
      include: { company: true },
    }),
    db.user.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (candidates.length === 0 || jobs.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="É preciso ter ao menos um candidato e uma vaga cadastrados."
        description="Cadastre um candidato e uma vaga antes de agendar uma entrevista."
        action={
          <Button asChild size="sm">
            <Link href="/candidates/new">Cadastrar candidato</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Agendar entrevista</h2>
        <p className="text-sm text-muted-foreground">Escolha o candidato, a vaga e defina data e horário.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createInterview} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="candidateId">Candidato *</Label>
                <select
                  id="candidateId"
                  name="candidateId"
                  required
                  defaultValue={searchParams.candidateId || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobId">Vaga *</Label>
                <select
                  id="jobId"
                  name="jobId"
                  required
                  defaultValue={searchParams.jobId || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date">Data *</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Horário *</Label>
                <Input id="time" name="time" type="time" required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="interviewerId">Entrevistador *</Label>
                <select
                  id="interviewerId"
                  name="interviewerId"
                  required
                  defaultValue={user.id}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {interviewers.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue="VIDEO"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meetingLink">Link da reunião</Label>
              <Input id="meetingLink" name="meetingLink" placeholder="https://meet.google.com/..." />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild type="button">
                <Link href="/interviews">Cancelar</Link>
              </Button>
              <SubmitButton pendingText="Agendando...">Agendar entrevista</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
