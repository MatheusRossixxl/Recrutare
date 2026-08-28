import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { updateCandidate } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";

export default async function EditCandidatePage({ params }: { params: { id: string } }) {
  const user = await requireSession();

  const candidate = await db.candidate.findFirst({
    where: { id: params.id, organizationId: user.organizationId },
  });

  if (!candidate) notFound();

  const updateCandidateWithId = updateCandidate.bind(null, candidate.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Editar candidato</h2>
        <p className="text-sm text-muted-foreground">Atualize os dados de {candidate.name}.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={updateCandidateWithId} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" defaultValue={candidate.name} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" defaultValue={candidate.email} required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" defaultValue={candidate.phone ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" defaultValue={candidate.city ?? ""} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desiredRole">Cargo pretendido</Label>
              <Input id="desiredRole" name="desiredRole" defaultValue={candidate.desiredRole ?? ""} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" name="linkedin" defaultValue={candidate.linkedin ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="portfolio">Portfólio</Label>
                <Input id="portfolio" name="portfolio" defaultValue={candidate.portfolio ?? ""} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="education">Formação</Label>
              <Input id="education" name="education" defaultValue={candidate.education ?? ""} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="experience">Experiência profissional</Label>
              <Textarea id="experience" name="experience" rows={4} defaultValue={candidate.experience ?? ""} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
                <Input id="skills" name="skills" defaultValue={candidate.skills ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languages">Idiomas</Label>
                <Input id="languages" name="languages" defaultValue={candidate.languages ?? ""} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={candidate.notes ?? ""} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild type="button">
                <Link href={`/candidates/${candidate.id}`}>Cancelar</Link>
              </Button>
              <SubmitButton pendingText="Salvando...">Salvar alterações</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
