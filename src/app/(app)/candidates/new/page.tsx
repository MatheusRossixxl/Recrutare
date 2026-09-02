import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { createCandidate } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function NewCandidatePage({ searchParams }: { searchParams: { jobId?: string } }) {
  const user = await requireSession();

  const jobs = await db.job.findMany({
    where: { organizationId: user.organizationId, status: { in: ["OPEN", "IN_PROGRESS", "DRAFT"] } },
    orderBy: { createdAt: "desc" },
    include: { company: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Novo candidato</h2>
        <p className="text-sm text-muted-foreground">
          O currículo em PDF pode ser enviado depois, pela página do candidato, para extração automática de dados.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createCandidate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="desiredRole">Cargo pretendido</Label>
                <Input id="desiredRole" name="desiredRole" placeholder="Ex: Gerente Comercial" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desiredRoles">Cargos de interesse</Label>
                <Input id="desiredRoles" name="desiredRoles" placeholder="Ex: Gerente Administrativo, Gerente Comercial" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="professionalSummary">Resumo profissional</Label>
              <Textarea
                id="professionalSummary"
                name="professionalSummary"
                rows={4}
                placeholder="Resumo da trajetória profissional do candidato"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input id="birthDate" name="birthDate" type="date" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="secondaryEmail">E-mail secundário</Label>
                <Input id="secondaryEmail" name="secondaryEmail" type="email" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="portfolio">Portfólio</Label>
                <Input id="portfolio" name="portfolio" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="education">Formação acadêmica</Label>
              <Textarea
                id="education"
                name="education"
                rows={4}
                placeholder="Graduação, pós-graduação, MBA, etc."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="courses">Cursos e certificações</Label>
              <Textarea
                id="courses"
                name="courses"
                rows={4}
                placeholder="Cursos, certificações e especializações"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="experience">Experiência profissional</Label>
              <Textarea id="experience" name="experience" rows={4} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
                <Input id="skills" name="skills" placeholder="React, Node.js, SQL" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languages">Idiomas</Label>
                <Input id="languages" name="languages" placeholder="Português, Inglês" />
              </div>
            </div>

            {jobs.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="jobId">Adicionar diretamente a uma vaga (opcional)</Label>
                <select
                  id="jobId"
                  name="jobId"
                  defaultValue={searchParams.jobId || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Nenhuma vaga por enquanto</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="salaryExpectation">Pretensão salarial</Label>
                <Input id="salaryExpectation" name="salaryExpectation" type="number" step="0.01" placeholder="3500" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hasDriverLicense">Possui CNH?</Label>
                <select
                  id="hasDriverLicense"
                  name="hasDriverLicense"
                  defaultValue=""
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
                <Input id="driverLicenseCategory" name="driverLicenseCategory" placeholder="Ex: A,B" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">País</Label>
                <Input id="country" name="country" defaultValue="Brasil" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" name="address" placeholder="Rua, número, bairro, cidade, estado, CEP" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="gender">Sexo</Label>
                <Input id="gender" name="gender" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="race">Raça/cor</Label>
                <Input id="race" name="race" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sexualOrientation">Orientação sexual</Label>
                <Input id="sexualOrientation" name="sexualOrientation" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="genderIdentity">Gênero</Label>
                <Input id="genderIdentity" name="genderIdentity" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SubmitButton pendingText="Cadastrando...">Cadastrar candidato</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
