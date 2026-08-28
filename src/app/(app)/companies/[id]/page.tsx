import { notFound } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail, Phone, Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { JOB_STATUS_LABELS, JOB_STATUS_VARIANT } from "@/lib/constants";
import { CompanyArchiveButton, CompanyRestoreButton } from "@/components/companies/company-archive-button";
import { CompanyDeleteButton } from "@/components/companies/company-delete-button";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const user = await requireSession();

  const company = await db.company.findFirst({
    where: { id: params.id, organizationId: user.organizationId },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      },
    },
  });

  if (!company) notFound();

  const openJobs = company.jobs.filter((j) => j.status === "OPEN" || j.status === "IN_PROGRESS");
  const closedJobs = company.jobs.filter((j) => j.status === "CLOSED");

  return (
    <div className="space-y-6">
      {company.archived && (
        <div className="flex items-center justify-between rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <span>Esta empresa está arquivada e não aparece nas listagens padrão.</span>
          <CompanyRestoreButton companyId={company.id} companyName={company.name} />
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{company.name}</h2>
          <p className="text-sm text-muted-foreground">{company.segment || "Segmento não informado"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/companies/${company.id}/edit`}>
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          </Button>
          {!company.archived && (
            <>
              <CompanyArchiveButton
                companyId={company.id}
                companyName={company.name}
                activeJobsCount={openJobs.length}
              />
              <CompanyDeleteButton
                companyId={company.id}
                companyName={company.name}
              />
            </>
          )}
          <Button asChild>
            <Link href={`/jobs/new?companyId=${company.id}`}>
              <Plus className="h-4 w-4" /> Nova vaga
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vagas</CardTitle>
          </CardHeader>
          <CardContent>
            {company.jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Nenhuma vaga cadastrada ainda."
                description="Crie a primeira vaga para começar a receber candidatos para esta empresa."
                action={
                  <Button asChild size="sm">
                    <Link href={`/jobs/new?companyId=${company.id}`}>Criar vaga</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {company.jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job._count.applications} candidato(s)</p>
                    </div>
                    <Badge variant={JOB_STATUS_VARIANT[job.status]}>{JOB_STATUS_LABELS[job.status]}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {company.cnpj && (
              <div>
                <p className="text-xs text-muted-foreground">CNPJ</p>
                <p>{company.cnpj}</p>
              </div>
            )}
            {company.contactName && (
              <div>
                <p className="text-xs text-muted-foreground">Contato</p>
                <p>{company.contactName}</p>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <p>{company.email}</p>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <p>{company.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Cliente desde</p>
              <p>{formatDate(company.createdAt)}</p>
            </div>
            <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
              <span>{openJobs.length} vaga(s) ativas</span>
              <span>{closedJobs.length} encerrada(s)</span>
            </div>
            {company.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Observações</p>
                <p className="whitespace-pre-line">{company.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
