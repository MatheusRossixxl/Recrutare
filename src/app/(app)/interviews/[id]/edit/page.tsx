import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { updateInterview } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { INTERVIEW_TYPE_LABELS } from "@/lib/constants";
import { toInputDate, toInputTime } from "@/lib/utils";

export default async function EditInterviewPage({ params }: { params: { id: string } }) {
  const user = await requireSession();

  const [interview, interviewers] = await Promise.all([
    db.interview.findFirst({
      where: { id: params.id, organizationId: user.organizationId },
      include: { candidate: true, job: { include: { company: true } } },
    }),
    db.user.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!interview) notFound();

  const updateInterviewWithId = updateInterview.bind(null, interview.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Editar entrevista</h2>
        <p className="text-sm text-muted-foreground">
          {interview.candidate.name} · {interview.job.title} — {interview.job.company.name}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={updateInterviewWithId} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date">Data *</Label>
                <Input id="date" name="date" type="date" required defaultValue={toInputDate(interview.scheduledAt)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Horário *</Label>
                <Input id="time" name="time" type="time" required defaultValue={toInputTime(interview.scheduledAt)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="interviewerId">Entrevistador *</Label>
                <select
                  id="interviewerId"
                  name="interviewerId"
                  required
                  defaultValue={interview.interviewerId}
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
                  defaultValue={interview.type}
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
              <Input id="meetingLink" name="meetingLink" defaultValue={interview.meetingLink ?? ""} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={interview.notes ?? ""} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild type="button">
                <Link href="/interviews">Cancelar</Link>
              </Button>
              <SubmitButton pendingText="Salvando...">Salvar alterações</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
