import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { createJob } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";

export default async function NewJobPage({ searchParams }: { searchParams: { companyId?: string } }) {
  const user = await requireSession();

  const [companies, recruiters] = await Promise.all([
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

  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Cadastre uma empresa antes de criar uma vaga."
        description="As vagas precisam estar vinculadas a uma empresa cliente."
        action={
          <Button asChild size="sm">
            <Link href="/companies/new">Cadastrar empresa</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Nova vaga</h2>
        <p className="text-sm text-muted-foreground">Preencha os detalhes da vaga a ser divulgada.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createJob} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" name="title" required placeholder="Ex: Desenvolvedor Backend Pleno" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyId">Empresa cliente *</Label>
                <select
                  id="companyId"
                  name="companyId"
                  required
                  defaultValue={searchParams.companyId || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
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
              <Textarea id="description" name="description" required rows={4} placeholder="Descreva as responsabilidades da vaga" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requirements">Requisitos * (separe por vírgula ou linha)</Label>
              <Textarea id="requirements" name="requirements" required rows={3} placeholder="Ex: React, Node.js, 3 anos de experiência" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="niceToHave">Diferenciais</Label>
              <Textarea id="niceToHave" name="niceToHave" rows={2} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="salaryMin">Salário mínimo</Label>
                <Input id="salaryMin" name="salaryMin" type="number" step="0.01" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salaryMax">Salário máximo</Label>
                <Input id="salaryMax" name="salaryMax" type="number" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="contractType">Tipo de contratação</Label>
                <select id="contractType" name="contractType" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="INTERNSHIP">Estágio</option>
                  <option value="TEMPORARY">Temporário</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workModel">Modelo de trabalho</Label>
                <select id="workModel" name="workModel" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                  <option value="ON_SITE">Presencial</option>
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="openings">Quantidade de vagas</Label>
                <Input id="openings" name="openings" type="number" min={1} defaultValue={1} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="location">Localização</Label>
                <Input id="location" name="location" placeholder="Ex: São Paulo, SP" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Data limite</Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="responsibleId">Recrutador responsável</Label>
                <select
                  id="responsibleId"
                  name="responsibleId"
                  defaultValue={user.id}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
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
                  defaultValue="NORMAL"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="LOW">Baixa</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue="OPEN" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                <option value="DRAFT">Rascunho</option>
                <option value="OPEN">Aberta</option>
                <option value="PAUSED">Pausada</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SubmitButton pendingText="Criando...">Criar vaga</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
