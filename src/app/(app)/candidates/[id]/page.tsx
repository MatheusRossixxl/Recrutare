import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Globe, Pencil, CalendarPlus, Briefcase } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initials, formatDateTime } from "@/lib/utils";
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLOR,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_STATUS_VARIANT,
  INTERVIEW_TYPE_LABELS,
} from "@/lib/constants";
import { AIAnalysisPanel } from "@/components/candidates/ai-analysis-panel";
import { CandidateArchiveButton, CandidateRestoreButton } from "@/components/candidates/candidate-archive-button";
import { CandidateDeleteButton } from "@/components/candidates/candidate-delete-button";
import { InterviewActions } from "@/components/interviews/interview-actions";
import type { CandidateJobAnalysis, ResumeExtraction } from "@/services/ai-service";

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const user = await requireSession();

  const candidate = await db.candidate.findFirst({
    where: { id: params.id, organizationId: user.organizationId },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        include: { job: { include: { company: true } }, stageHistory: { orderBy: { createdAt: "desc" } } },
      },
      resumes: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
      interviews: {
        orderBy: { scheduledAt: "desc" },
        include: { job: true, interviewer: true },
      },
    },
  });

  if (!candidate) notFound();

  function formatStructuredText(text?: string | null) {
    if (!text) return null;

    const normalized = text
      .replace(/\\r\\n/g, "\\n")
      .replace(/\\n{3,}/g, "\\n\\n")
      .trim();

    const lines = normalized
      .split(/\\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const blocks: string[] = [];
    let current: string[] = [];

    const flush = () => {
      if (current.length > 0) {
        blocks.push(current.join("\\n"));
        current = [];
      }
    };

    for (const line of lines) {
      const isNewBlock =
        /^(Período|Periodo|Ano de conclusão|Ano de conclus[aã]o)\\b/i.test(line) &&
        current.length > 0;

      if (isNewBlock) {
        flush();
      }

      current.push(line);
    }

    flush();

    return blocks.map((block, index) => (
      <div
        key={index}
        className={
          index > 0
            ? "border-t border-border pt-5 mt-5"
            : ""
        }
      >
        <p className="whitespace-pre-line leading-relaxed">
          {block}
        </p>
      </div>
    ));
  }


const skills = candidate.skills
    ?.split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

  const uniqueSkills = Array.from(
    new Map(
      skills.map((skill) => [
        skill
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim(),
        skill,
      ])
    ).values()
  );

  const activeApplicationsCount = candidate.applications.filter(
    (a) => a.stage !== "HIRED" && a.stage !== "REJECTED"
  ).length;

  return (
    <div className="space-y-6">
      {candidate.archived && (
        <div className="flex items-center justify-between rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <span>Este candidato está arquivado e não aparece nas listagens padrão.</span>
          <CandidateRestoreButton candidateId={candidate.id} candidateName={candidate.name} />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-base">{initials(candidate.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{candidate.name}</h2>
            {candidate.desiredRole && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" /> {candidate.desiredRole}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {candidate.phone}
                </span>
              )}
              {candidate.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {candidate.city}
                </span>
              )}
              {candidate.linkedin && (
                <a href={candidate.linkedin} target="_blank" className="flex items-center gap-1 hover:text-primary">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </a>
              )}
              {candidate.portfolio && (
                <a href={candidate.portfolio} target="_blank" className="flex items-center gap-1 hover:text-primary">
                  <Globe className="h-3 w-3" /> Portfólio
                </a>
              )}
            </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {candidate.birthDate && (
                  <span>
                    Nascimento: {candidate.birthDate.toLocaleDateString("pt-BR")}
                  </span>
                )}
                {candidate.gender && (
                  <span>
                    Sexo: {candidate.gender}
                  </span>
                )}
                {candidate.race && (
                  <span>
                    Raça/cor: {candidate.race}
                  </span>
                )}
                {candidate.sexualOrientation && (
                  <span>
                    Orientação: {candidate.sexualOrientation}
                  </span>
                )}
                {candidate.genderIdentity && (
                  <span>
                    Gênero: {candidate.genderIdentity}
                  </span>
                )}
              </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/candidates/${candidate.id}/edit`}>
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          </Button>
          {!candidate.archived && (
            <CandidateArchiveButton

              candidateId={candidate.id}
              candidateName={candidate.name}
              activeApplicationsCount={activeApplicationsCount}
            />
          )}
          <CandidateDeleteButton
            candidateId={candidate.id}
            candidateName={candidate.name}
          />
          <Button asChild>
            <Link href={`/interviews/new?candidateId=${candidate.id}`}>
              <CalendarPlus className="h-4 w-4" /> Agendar entrevista
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-7 text-sm">

              {candidate.professionalSummary && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Resumo profissional</p>
                  <p className="whitespace-pre-line">{candidate.professionalSummary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Cargo pretendido</p>
                  <p>{candidate.desiredRole || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Cargos de interesse</p>
                  <p>{candidate.desiredRoles || "Não informado"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Data de nascimento</p>
                  <p>
                    {candidate.birthDate
                      ? candidate.birthDate.toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">E-mail secundário</p>
                  <p>{candidate.secondaryEmail || "Não informado"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Formação acadêmica</p>
                {candidate.education
  ? formatStructuredText(candidate.education)
  : <p>Não informado</p>}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Cursos e certificações</p>
                {candidate.courses
  ? formatStructuredText(candidate.courses)
  : <p>Não informado</p>}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Experiência profissional</p>
                {candidate.experience
  ? formatStructuredText(candidate.experience)
  : <p>Não informado</p>}
              </div>

              {uniqueSkills.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Habilidades
                  </p>

                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueSkills.slice(0, 12).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>

                      {uniqueSkills.length > 12 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          + {uniqueSkills.length - 12} habilidades — clique para ver todas
                        </p>
                      )}
                    </summary>

                    {uniqueSkills.length > 12 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                        {uniqueSkills.slice(12).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </details>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Habilidades
                  </p>
                  <p>Não informado</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground">Idiomas</p>
                <p>{candidate.languages || "Não informado"}</p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pretensão salarial</p>
                  <p>
                    {candidate.salaryExpectation !== null && candidate.salaryExpectation !== undefined
                      ? candidate.salaryExpectation.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">CNH</p>
                  <p>
                    {candidate.hasDriverLicense === true
                      ? `Sim${candidate.driverLicenseCategory ? ` — Categoria ${candidate.driverLicenseCategory}` : ""}`
                      : candidate.hasDriverLicense === false
                        ? "Não"
                        : "Não informado"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Endereço</p>
                <p>{candidate.address || "Não informado"}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">País</p>
                <p>{candidate.country || "Não informado"}</p>
              </div>


              {candidate.notes && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Observações</p>
                  <p className="whitespace-pre-line">{candidate.notes}</p>
                </div>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidaturas e histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Este candidato ainda não está em nenhuma vaga.</p>
              ) : (
                candidate.applications.map((app) => (
                  <div key={app.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link href={`/jobs/${app.jobId}`} className="font-medium hover:underline">
                          {app.job.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{app.job.company.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${PIPELINE_STAGE_COLOR[app.stage]}`} />
                        <span className="text-xs text-muted-foreground">{PIPELINE_STAGE_LABELS[app.stage]}</span>
                      </div>
                    </div>

                    {app.stageHistory.length > 0 && (
                      <ul className="mt-2 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                        {app.stageHistory.map((h) => (
                          <li key={h.id}>
                            {formatDateTime(h.createdAt)} — movido para {PIPELINE_STAGE_LABELS[h.toStage]}
                            {h.changedByName ? ` por ${h.changedByName}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3">
                      <AIAnalysisPanel
                        applicationId={app.id}
                        jobTitle={app.job.title}
                        initialAnalysis={app.aiAnalysisJson ? (JSON.parse(app.aiAnalysisJson) as CandidateJobAnalysis) : null}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          

          <Card>
            <CardHeader>
              <CardTitle>Entrevistas</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.interviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma entrevista agendada ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {candidate.interviews.map((interview) => (
                    <li key={interview.id} className="rounded-md border border-border p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{interview.job.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(interview.scheduledAt)} · {INTERVIEW_TYPE_LABELS[interview.type] ?? interview.type}
                          </p>
                          <p className="text-xs text-muted-foreground">Com {interview.interviewer.name}</p>
                        </div>
                        <Badge variant={INTERVIEW_STATUS_VARIANT[interview.status]}>
                          {INTERVIEW_STATUS_LABELS[interview.status] ?? interview.status}
                        </Badge>
                      </div>
                      {interview.notes && <p className="mt-2 text-xs text-muted-foreground">{interview.notes}</p>}
                      <div className="mt-3">
                        <InterviewActions
                          interviewId={interview.id}
                          candidateName={candidate.name}
                          status={interview.status}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem atividades registradas.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {candidate.activities.map((a) => (
                    <li key={a.id} className="border-b border-border pb-2 last:border-0">
                      <p>{a.description}</p>
                      <p className="text-muted-foreground">{formatDateTime(a.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
