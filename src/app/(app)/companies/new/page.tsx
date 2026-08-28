import { createCompany } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Nova empresa cliente</h2>
        <p className="text-sm text-muted-foreground">Cadastre os dados da empresa para a qual você vai recrutar.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createCompany} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" name="cnpj" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="segment">Segmento</Label>
                <Input id="segment" name="segment" placeholder="Ex: Tecnologia, Varejo..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Contato responsável</Label>
                <Input id="contactName" name="contactName" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={4} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SubmitButton pendingText="Cadastrando...">Cadastrar empresa</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
