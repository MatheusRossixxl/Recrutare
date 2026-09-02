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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="desiredRole">Cargo pretendido</Label>
                <Input id="desiredRole" name="desiredRole" defaultValue={candidate.desiredRole ?? ""} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desiredRoles">Cargos de interesse</Label>
                <Input id="desiredRoles" name="desiredRoles" defaultValue={candidate.desiredRoles ?? ""} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="professionalSummary">Resumo profissional</Label>
              <Textarea
                id="professionalSummary"
                name="professionalSummary"
                rows={4}
                defaultValue={candidate.professionalSummary ?? ""}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={candidate.birthDate ? candidate.birthDate.toISOString().split("T")[0] : ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="secondaryEmail">E-mail secundário</Label>
                <Input
                  id="secondaryEmail"
                  name="secondaryEmail"
                  type="email"
                  defaultValue={candidate.secondaryEmail ?? ""}
                />
              </div>
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
              <Label htmlFor="education">Formação acadêmica</Label>
              <Textarea
                id="education"
                name="education"
                rows={4}
                defaultValue={candidate.education ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="courses">Cursos e certificações</Label>
              <Textarea
                id="courses"
                name="courses"
                rows={4}
                defaultValue={candidate.courses ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="experience">Experiência profissional</Label>
              <Textarea id="experience" name="experience" rows={4} defaultValue={candidate.experience ?? ""} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
                <Textarea
  id="skills"
  name="skills"
  defaultValue={candidate.skills ?? ""}
  placeholder="Digite as habilidades separadas por vírgula ou uma por linha"
  className="min-h-[80px]"
/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languages">Idiomas</Label>
                <Input id="languages" name="languages" defaultValue={candidate.languages ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="salaryExpectation">Pretensão salarial</Label>
                <Input
                  id="salaryExpectation"
                  name="salaryExpectation"
                  type="number"
                  step="0.01"
                  defaultValue={candidate.salaryExpectation ?? ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hasDriverLicense">Possui CNH?</Label>
                <select
                  id="hasDriverLicense"
                  name="hasDriverLicense"
                  defaultValue={
                    candidate.hasDriverLicense === null || candidate.hasDriverLicense === undefined
                      ? ""
                      : candidate.hasDriverLicense
                        ? "true"
                        : "false"
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Não informado</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driverLicenseCategory">Categoria da CNH</Label>
                <Input
                  id="driverLicenseCategory"
                  name="driverLicenseCategory"
                  defaultValue={candidate.driverLicenseCategory ?? ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={candidate.country ?? ""}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                defaultValue={candidate.address ?? ""}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="gender">Sexo</Label>
                <Input id="gender" name="gender" defaultValue={candidate.gender ?? ""} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="race">Raça/cor</Label>
                <Input id="race" name="race" defaultValue={candidate.race ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sexualOrientation">Orientação sexual</Label>
                <Input
                  id="sexualOrientation"
                  name="sexualOrientation"
                  defaultValue={candidate.sexualOrientation ?? ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="genderIdentity">Gênero</Label>
                <Input
                  id="genderIdentity"
                  name="genderIdentity"
                  defaultValue={candidate.genderIdentity ?? ""}
                />
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
