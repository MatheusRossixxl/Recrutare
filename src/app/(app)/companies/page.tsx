import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { CompanyArchiveButton } from "@/components/companies/company-archive-button";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const user = await requireSession();
  const q = searchParams.q?.trim() || "";
  const status = searchParams.status === "archived" ? "archived" : searchParams.status === "all" ? "all" : "active";

  const companies = await db.company.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status === "active" ? { archived: false } : status === "archived" ? { archived: true } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { cnpj: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { jobs: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Empresas clientes</h2>
          <p className="text-sm text-muted-foreground">Empresas para as quais você recruta.</p>
        </div>
        <Button asChild>
          <Link href="/companies/new">
            <Plus className="h-4 w-4" /> Nova empresa
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Buscar por nome, CNPJ ou email..." className="pl-9" />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          <option value="active">Ativas</option>
          <option value="archived">Arquivadas</option>
          <option value="all">Todas</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>
        {(q || status !== "active") && (
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href="/companies">Limpar</Link>
          </Button>
        )}
      </form>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={q || status !== "active" ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada ainda."}
          description={
            q || status !== "active"
              ? "Tente ajustar a busca ou os filtros."
              : "Cadastre sua primeira empresa cliente para começar a criar vagas."
          }
          action={
            !q && status === "active" ? (
              <Button asChild size="sm">
                <Link href="/companies/new">Cadastrar empresa</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="h-full transition-shadow hover:shadow-md">
              <CardContent className="pt-5">
                <Link href={`/companies/${company.id}`} className="block">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.segment || "Segmento não informado"}</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Building2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{company._count.jobs} vaga(s)</span>
                    <span>Desde {formatDate(company.createdAt)}</span>
                  </div>
                  {company.archived && (
                    <Badge variant="warning" className="mt-3">
                      Arquivada
                    </Badge>
                  )}
                </Link>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
