import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, MapPin, Wallet, KanbanSquare, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANT,
  WORK_MODEL_LABELS,
  CONTRACT_TYPE_LABELS,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLOR,
} from "@/lib/constants";
import { JobStatusSelect } from "@/components/jobs/job-status-select";
import { JobArchiveButton, JobRestoreButton } from "@/components/jobs/job-archive-button";
import { CandidateJobRemoveButton } from "@/components/jobs/candidate-job-remove-button";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const user = await requireSession();

  const job = await db.job.findFirst({
    where: { id: params.id, organizationId: user.organizationId },
    include: {
      company: true,
      applications: {
        orderBy: { createdAt: "desc" },
        include: { candidate: true },
      },
    },
  });

  if (!job) notFound();

  const activeApplicationsCount = job.applications.filter(
    (a) => a.stage !== "HIRED" && a.stage !== "REJECTED"
  ).length;

  return (
    <div className="space-y-6">
      {job.archived && (
        <div className="flex items-center justify-between rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <span>Esta vaga está arquivada e não aparece nas listagens padrão.</span>
          <JobRestoreButton jobId={job.id} jobTitle={job.title} />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <Link href={`/companies/${job.companyId}`} className="text-sm text-primary hover:underline">
            {job.company.name}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                job.priority === "LOW"
                  ? "bg-green-100 text-green-700"
                  : job.priority === "NORMAL"
                    ? "bg-yellow-100 text-yellow-700"
                    : job.priority === "HIGH"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
              }`}
            >
              Prioridade: {job.priority === "LOW"
                ? "Baixa"
                : job.priority === "HIGH"
                  ? "Alta"
                  : job.priority === "URGENT"
                    ? "Urgente"
                    : "Normal"}
            </span>
          <JobStatusSelect jobId={job.id} status={job.status} />
          <Button asChild variant="outline">
            <Link href={`/jobs/${job.id}/edit`}>
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          </Button>
          {!job.archived && (
            <JobArchiveButton jobId={job.id} jobTitle={job.title} activeApplicationsCount={activeApplicationsCount} />
          )}
          <Button asChild variant="outline">
            <Link href={`/pipeline?jobId=${job.id}`}>
              <KanbanSquare className="h-4 w-4" /> Ver no pipeline
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="whitespace-pre-line">{job.description}</p>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Requisitos</p>
              <p className="whitespace-pre-line">{job.requirements}</p>
            </div>
            {job.niceToHave && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Diferenciais</p>
                <p className="whitespace-pre-line">{job.niceToHave}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={JOB_STATUS_VARIANT[job.status]}>{JOB_STATUS_LABELS[job.status]}</Badge>
              <span className="text-xs text-muted-foreground">{CONTRACT_TYPE_LABELS[job.contractType]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {job.location || "Não informado"} · {WORK_MODEL_LABELS[job.workModel]}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              {formatCurrency(job.salaryMin)} – {formatCurrency(job.salaryMax)}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {job.openings} vaga(s) disponíveis
            </div>
            {job.deadline && (
              <div className="text-xs text-muted-foreground">Prazo: {formatDate(job.deadline)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Candidatos ({job.applications.length})</CardTitle>
          <Button asChild size="sm">
            <Link href={`/candidates?jobId=${job.id}`}>
              Adicionar candidato
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {job.applications.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum candidato nesta vaga ainda."
              description="Adicione candidatos pela página de Candidatos ou pelo pipeline."
              action={
                <Button asChild size="sm">
                  <Link href="/candidates/new">Cadastrar candidato</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {job.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex w-full items-center gap-4 rounded-md border border-border p-3 text-sm"
                >
                  <Link
                    href={`/candidates/${app.candidateId}`}
                    className="flex min-w-0 flex-1 items-center gap-6 rounded-md p-2 hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{app.candidate.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.candidate.city || "Cidade não informada"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${PIPELINE_STAGE_COLOR[app.stage]}`} />
                      <span className="text-xs text-muted-foreground">
                        {PIPELINE_STAGE_LABELS[app.stage]}
                      </span>
                    </div>
                  </Link>

                  <div className="shrink-0">
                    <CandidateJobRemoveButton
                      applicationId={app.id}
                      candidateName={app.candidate.name}
                      jobTitle={job.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
