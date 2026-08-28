import Link from "next/link";
import { Briefcase, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { JOB_STATUS_LABELS, JOB_STATUS_VARIANT, WORK_MODEL_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; companyId?: string; workModel?: string; archived?: string };
}) {
  const user = await requireSession();
  const q = searchParams.q?.trim() || "";
  const status = searchParams.status || "";
  const companyId = searchParams.companyId || "";
  const workModel = searchParams.workModel || "";
  const archivedFilter = searchParams.archived === "archived" ? "archived" : searchParams.archived === "all" ? "all" : "active";

  const [jobs, companies] = await Promise.all([
    db.job.findMany({
      where: {
        organizationId: user.organizationId,
        ...(archivedFilter === "active" ? { archived: false } : archivedFilter === "archived" ? { archived: true } : {}),
        ...(status ? { status } : {}),
        ...(companyId ? { companyId } : {}),
        ...(workModel ? { workModel } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { company: { name: { contains: q } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        responsible: {
          select: { name: true },
        },
        _count: { select: { applications: true } },
      },
    }),
    db.company.findMany({
      where: { organizationId: user.organizationId, archived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const hasFilters = q || status || companyId || workModel || archivedFilter !== "active";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Vagas</h2>
          <p className="text-sm text-muted-foreground">Todas as vagas em aberto e encerradas.</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4" /> Nova vaga
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Título ou empresa..." className="pl-9" />
        </div>
        <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="">Todos os status</option>
          {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="companyId" defaultValue={companyId} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="">Todas as empresas</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="workModel" defaultValue={workModel} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="">Todos os modelos</option>
          {Object.entries(WORK_MODEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="archived" defaultValue={archivedFilter} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          <option value="active">Ativas</option>
          <option value="archived">Arquivadas</option>
          <option value="all">Todas</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href="/jobs">Limpar</Link>
          </Button>
        )}
      </form>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={hasFilters ? "Nenhuma vaga encontrada." : "Nenhuma vaga cadastrada ainda."}
          description={hasFilters ? "Tente ajustar a busca ou os filtros." : "Crie sua primeira vaga para começar a receber candidatos."}
          action={
            !hasFilters ? (
              <Button asChild size="sm">
                <Link href="/jobs/new">Criar vaga</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Vaga</th>
                <th className="px-4 py-3 text-left font-medium">Empresa</th>
                <th className="px-4 py-3 text-left font-medium">Modelo</th>
                <th className="px-4 py-3 text-left font-medium">Candidatos</th>
                <th className="px-4 py-3 text-left font-medium">Responsável</th>
                <th className="px-4 py-3 text-left font-medium">Prioridade</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{job.company.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{WORK_MODEL_LABELS[job.workModel]}</td>
                  <td className="text-tabular px-4 py-3">{job._count.applications}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job.responsible?.name || "Não definido"}
                  </td>
                  <td className="px-4 py-3">
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
                      {job.priority === "LOW"
                        ? "Baixa"
                        : job.priority === "HIGH"
                          ? "Alta"
                          : job.priority === "URGENT"
                            ? "Urgente"
                            : "Normal"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={JOB_STATUS_VARIANT[job.status]}>{JOB_STATUS_LABELS[job.status]}</Badge>
                      {job.archived && <Badge variant="warning">Arquivada</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
