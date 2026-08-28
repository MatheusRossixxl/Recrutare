import { Briefcase, Users, TrendingUp, Clock, Building2 } from "lucide-react";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGE_LABELS } from "@/lib/constants";

export default async function ReportsPage() {
  const user = await requireSession();
  const organizationId = user.organizationId;

const [
  openJobs,
  candidatesByStage,
  hiredCount,
  totalApplications,
  jobsByCompany,
  hiredApplications,
] = await Promise.all([
  db.job.count({
    where: {
      organizationId,
      archived: false,
      status: "OPEN",
    },
  }),

  db.application.groupBy({
    by: ["stage"],
    where: {
      job: {
        organizationId,
        archived: false,
      },
    },
    _count: {
      _all: true,
    },
  }),

  db.application.count({
    where: {
      job: {
        organizationId,
      },
      stage: "HIRED",
    },
  }),

  db.application.count({
    where: {
      job: {
        organizationId,
      },
    },
  }),

  db.job.groupBy({
    by: ["companyId"],
    where: {
      organizationId,
      archived: false,
    },
    _count: {
      _all: true,
    },
  }),

  db.application.findMany({
    where: {
      job: {
        organizationId,
      },
      stage: "HIRED",
    },
    select: {
      createdAt: true,
      stageHistory: {
        where: {
          toStage: "HIRED",
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
        select: {
          createdAt: true,
        },
      },
    },
  }),
]);

const processTimes = hiredApplications
  .filter((application) => application.stageHistory.length > 0)
  .map((application) => {
    const hiredAt = application.stageHistory[0].createdAt;

    const difference =
      hiredAt.getTime() - application.createdAt.getTime();

    return difference / (1000 * 60 * 60 * 24);
  });

const averageProcessTime =
  processTimes.length > 0
    ? processTimes.reduce((sum, days) => sum + days, 0) /
      processTimes.length
    : 0;

  const hiringRate =
    totalApplications > 0
      ? ((hiredCount / totalApplications) * 100).toFixed(1)
      : "0.0";

  const companies = await db.company.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const companyMap = new Map(
    companies.map((company) => [company.id, company.name])
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe os principais indicadores do seu processo de recrutamento.
        </p>
      </div>

      {/* Indicadores principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vagas abertas</p>
                <p className="mt-1 text-2xl font-bold">{openJobs}</p>
              </div>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidaturas</p>
                <p className="mt-1 text-2xl font-bold">{totalApplications}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contratados</p>
                <p className="mt-1 text-2xl font-bold">{hiredCount}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Taxa de contratação
                </p>
                <p className="mt-1 text-2xl font-bold">{hiringRate}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidatos por etapa */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos por etapa</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {candidatesByStage.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum candidato no processo.
              </p>
            ) : (
              candidatesByStage.map((stage) => (
                <div
                  key={stage.stage}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span className="text-sm font-medium">
                    {PIPELINE_STAGE_LABELS[stage.stage] ?? stage.stage}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {stage._count._all}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vagas por cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Vagas por cliente</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {jobsByCompany.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma vaga cadastrada.
              </p>
            ) : (
              jobsByCompany.map((company) => (
                <div
                  key={company.companyId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />

                    <span className="text-sm font-medium">
                      {companyMap.get(company.companyId) ??
                        "Cliente não encontrado"}
                    </span>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {company._count._all} vaga(s)
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tempo médio */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Clock className="h-4 w-4" />
      Tempo médio do processo
    </CardTitle>
  </CardHeader>

  <CardContent>
    <p className="text-2xl font-bold">
      {averageProcessTime > 0
        ? `${averageProcessTime.toFixed(1)} dias`
        : "Sem dados"}
    </p>

    <p className="mt-1 text-sm text-muted-foreground">
      Tempo médio entre o cadastro e a contratação.
    </p>
  </CardContent>
</Card>
    </div>
  );
}
