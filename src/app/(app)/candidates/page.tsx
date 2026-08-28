import Link from "next/link";
import { Users, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/constants";
import { AddToJobButton } from "@/components/candidates/add-to-job-button";

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { q?: string; stage?: string; jobId?: string; city?: string; status?: string; page?: string };
}) {
  const user = await requireSession();
  const q = searchParams.q?.trim() || "";
  const stage = searchParams.stage || "";
  const jobId = searchParams.jobId || "";
  const city = searchParams.city || "";
  const status = searchParams.status === "archived" ? "archived" : searchParams.status === "all" ? "all" : "active";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 20;

  const [candidates, totalCandidates, jobs, cityRows] = await Promise.all([
    db.candidate.findMany({
      where: {
        organizationId: user.organizationId,
        ...(status === "active" ? { archived: false } : status === "archived" ? { archived: true } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { skills: { contains: q } },
                { city: { contains: q } },
              ],
            }
          : {}),
        ...(city ? { city } : {}),
        ...(stage
          ? {
              applications: {
                some: {
                  stage,
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { applications: true } },
        applications: jobId
          ? {
              where: { jobId },
              select: { jobId: true },
            }
          : false,
      },
    }),
    db.candidate.count({
      where: {
        organizationId: user.organizationId,
        ...(status === "active" ? { archived: false } : status === "archived" ? { archived: true } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { skills: { contains: q } },
                { city: { contains: q } },
              ],
            }
          : {}),
        ...(city ? { city } : {}),
        ...(stage
          ? {
              applications: {
                some: {
                  stage,
                },
              },
            }
          : {}),
      },
    }),
    db.job.findMany({
      where: { organizationId: user.organizationId, archived: false },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.candidate.findMany({
      where: { organizationId: user.organizationId, city: { not: null } },
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    }),
  ]);

  const cities = cityRows.map((c) => c.city).filter(Boolean) as string[];
  const totalPages = Math.max(1, Math.ceil(totalCandidates / pageSize));
  const hasFilters = q || stage || jobId || city || status !== "active";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Candidatos</h2>
          <p className="text-sm text-muted-foreground">Banco de talentos da sua operação.</p>
        </div>
        <Button asChild>
          <Link href="/candidates/new">
            <Plus className="h-4 w-4" /> Novo candidato
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Nome, habilidade, cidade..." className="pl-9" />
        </div>
        <select name="stage" defaultValue={stage} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="">Todas as etapas</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>
              {PIPELINE_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        <select name="jobId" defaultValue={jobId} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="">Todas as vagas</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <select name="city" defaultValue={city} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="active">Ativos</option>
          <option value="archived">Arquivados</option>
          <option value="all">Todos</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href="/candidates">Limpar</Link>
          </Button>
        )}
      </form>

      {candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasFilters ? "Nenhum candidato encontrado." : "Nenhum candidato cadastrado ainda."}
          description={
            hasFilters
              ? "Tente ajustar a busca ou os filtros."
              : "Cadastre seu primeiro candidato para começar a montar seu banco de talentos."
          }
          action={
            !hasFilters ? (
              <Button asChild size="sm">
                <Link href="/candidates/new">Cadastrar candidato</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <Link
                href={`/candidates/${candidate.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials(candidate.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{candidate.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {candidate.city || "Cidade não informada"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {candidate._count.applications} candidatura(s)
                  </p>
                </div>

                {candidate.archived && (
                  <Badge variant="warning">Arquivado</Badge>
                )}
              </Link>

              {jobId && (
                <AddToJobButton
                  candidateId={candidate.id}
                  jobId={jobId}
                  alreadyAdded={candidate.applications.length > 0}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {totalCandidates > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCandidates)} de {totalCandidates} candidatos
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild disabled={page <= 1}>
              <Link
                href={`/candidates?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(stage ? { stage } : {}),
                  ...(jobId ? { jobId } : {}),
                  ...(city ? { city } : {}),
                  ...(status !== "active" ? { status } : {}),
                  page: String(page - 1),
                }).toString()}`}
              >
                Anterior
              </Link>
            </Button>

            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>

            <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
              <Link
                href={`/candidates?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(stage ? { stage } : {}),
                  ...(jobId ? { jobId } : {}),
                  ...(city ? { city } : {}),
                  ...(status !== "active" ? { status } : {}),
                  page: String(page + 1),
                }).toString()}`}
              >
                Próxima
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
