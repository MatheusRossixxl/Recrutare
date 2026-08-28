import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { updateJob } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { toInputDate } from "@/lib/utils";

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const user = await requireSession();

  const [job, companies, recruiters] = await Promise.all([
    db.job.findFirst({ where: { id: params.id, organizationId: user.organizationId } }),
    db.company.findMany({
      where: { organizationId: user.organizationId, archived: false },
      orderBy: { name: "asc" },
    }),
    db.user.findMany({
      where: { organizationId: user.organizationId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);

  if (!job) notFound();

  const updateJobWithId = updateJob.bind(null, job.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Editar vaga</h2>
        <p className="text-sm text-muted-foreground">Atualize os detalhes de {job.title}.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={updateJobWithId} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" name="title" required defaultValue={job.title} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyId">Empresa cliente *</Label>
                <select
                  id="companyId"
                  name="companyId"
                  required
                  defaultValue={job.companyId}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea id="description" name="description" required rows={4} defaultValue={job.description} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requirements">Requisitos * (separe por vírgula ou linha)</Label>
              <Textarea id="requirements" name="requirements" required rows={3} defaultValue={job.requirements} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="niceToHave">Diferenciais</Label>
              <Textarea id="niceToHave" name="niceToHave" rows={2} defaultValue={job.niceToHave ?? ""} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="salaryMin">Salário mínimo</Label>
                <Input id="salaryMin" name="salaryMin" type="number" step="0.01" defaultValue={job.salaryMin ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salaryMax">Salário máximo</Label>
                <Input id="salaryMax" name="salaryMax" type="number" step="0.01" defaultValue={job.salaryMax ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="contractType">Tipo de contratação</Label>
                <select
                  id="contractType"
                  name="contractType"
                  defaultValue={job.contractType}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="INTERNSHIP">Estágio</option>
                  <option value="TEMPORARY">Temporário</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workModel">Modelo de trabalho</Label>
                <select
                  id="workModel"
                  name="workModel"
                  defaultValue={job.workModel}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="ON_SITE">Presencial</option>
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="openings">Quantidade de vagas</Label>
                <Input id="openings" name="openings" type="number" min={1} defaultValue={job.openings} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="location">Localização</Label>
                <Input id="location" name="location" defaultValue={job.location ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Data limite</Label>
                <Input id="deadline" name="deadline" type="date" defaultValue={toInputDate(job.deadline)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="responsibleId">Recrutador responsável</Label>
                <select
                  id="responsibleId"
                  name="responsibleId"
                  defaultValue={job.responsibleId ?? ""}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Não definido</option>
                  {(
                    await db.user.findMany({
                      where: { organizationId: user.organizationId, active: true },
                      orderBy: { name: "asc" },
                    })
                  ).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority">Prioridade</Label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue={job.priority}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="LOW">Baixa</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              O status da vaga (aberta, em processo, pausada, encerrada) é alterado diretamente na página da vaga.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild type="button">
                <Link href={`/jobs/${job.id}`}>Cancelar</Link>
              </Button>
              <SubmitButton pendingText="Salvando...">Salvar alterações</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
