import { Search } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const user = await requireSession();
  const q = searchParams.q?.trim();

  const [candidates, jobs, companies] = q
    ? await Promise.all([
        db.candidate.findMany({ where: { organizationId: user.organizationId, name: { contains: q } }, take: 10 }),
        db.job.findMany({ where: { organizationId: user.organizationId, title: { contains: q } }, take: 10 }),
        db.company.findMany({ where: { organizationId: user.organizationId, name: { contains: q } }, take: 10 }),
      ])
    : [[], [], []];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold">Busca global</h2>
      <form>
        <Input name="q" defaultValue={q} placeholder="Buscar candidatos, vagas ou empresas..." autoFocus />
      </form>

      {!q ? (
        <EmptyState icon={Search} title="Digite algo para buscar" description="Você pode buscar candidatos, vagas e empresas ao mesmo tempo." />
      ) : (
        <div className="space-y-6">
          <Section title="Candidatos" items={candidates.map((c) => ({ id: c.id, label: c.name, href: `/candidates/${c.id}` }))} />
          <Section title="Vagas" items={jobs.map((j) => ({ id: j.id, label: j.title, href: `/jobs/${j.id}` }))} />
          <Section title="Empresas" items={companies.map((c) => ({ id: c.id, label: c.name, href: `/companies/${c.id}` }))} />
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: { id: string; label: string; href: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className="block rounded-md border border-border p-2 text-sm hover:bg-muted">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
