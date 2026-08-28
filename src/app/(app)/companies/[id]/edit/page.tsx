import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { updateCompany } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const user = await requireSession();

  const company = await db.company.findFirst({
    where: { id: params.id, organizationId: user.organizationId },
  });

  if (!company) notFound();

  const updateCompanyWithId = updateCompany.bind(null, company.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Editar empresa</h2>
        <p className="text-sm text-muted-foreground">Atualize os dados de {company.name}.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={updateCompanyWithId} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" defaultValue={company.name} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" name="cnpj" defaultValue={company.cnpj ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="segment">Segmento</Label>
                <Input id="segment" name="segment" defaultValue={company.segment ?? ""} placeholder="Ex: Tecnologia, Varejo..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Contato responsável</Label>
                <Input id="contactName" name="contactName" defaultValue={company.contactName ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={company.email ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" defaultValue={company.phone ?? ""} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={4} defaultValue={company.notes ?? ""} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild type="button">
                <Link href={`/companies/${company.id}`}>Cancelar</Link>
              </Button>
              <SubmitButton pendingText="Salvando...">Salvar alterações</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
