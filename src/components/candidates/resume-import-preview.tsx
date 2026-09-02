"use client";

import * as React from "react";

import { Loader2, Check, X } from "lucide-react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Extraction = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;

  desiredRole?: string;
  desiredRoles?: string;

  professionalSummary?: string;
  summary?: string;

  birthDate?: string;

  secondaryEmail?: string;
  linkedin?: string;
  portfolio?: string;

  education?: string;
  courses?: string;
  experience?: string;

  skills?: string[];
  languages?: string[];

  salaryExpectation?: number | null;

  hasDriverLicense?: boolean | null;
  driverLicenseCategory?: string;

  gender?: string;
  race?: string;
  sexualOrientation?: string;
  genderIdentity?: string;

  address?: string;
  country?: string;

  [key: string]: unknown;
};

type Props = {
  extraction: Extraction;
  fileName: string;
  onCancel: () => void;
};

export function ResumeImportPreview({
  extraction,
  fileName,
  onCancel,
}: Props) {
  const router = useRouter();

  const [data, setData] = React.useState<Extraction>({
    ...extraction,
    professionalSummary:
      extraction.professionalSummary || extraction.summary || "",
    skills: Array.isArray(extraction.skills)
      ? extraction.skills
      : [],
    languages: Array.isArray(extraction.languages)
      ? extraction.languages
      : [],
  });

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");

  function update(field: string, value: string) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function confirm() {
    setPending(true);
    setError("");

    try {
      const res = await fetch(
        "/api/candidates/resume-import/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data,
            fileName,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error || "Não foi possível cadastrar o candidato."
        );
      }

      router.push(`/candidates/${result.candidate.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao confirmar cadastro."
      );
      setPending(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confira os dados antes de cadastrar</CardTitle>

        <p className="text-sm text-muted-foreground">
          O sistema extraiu estas informações do currículo.
          Você pode corrigir textos e espaçamentos antes de confirmar.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={data.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={data.email || ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input
              value={data.phone || ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cidade</Label>
            <Input
              value={data.city || ""}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cargo pretendido</Label>
            <Input
              value={data.desiredRole || ""}
              onChange={(e) => update("desiredRole", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cargos de interesse</Label>
            <Input
              value={data.desiredRoles || ""}
              onChange={(e) => update("desiredRoles", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data de nascimento</Label>
            <Input
              type="date"
              value={data.birthDate || ""}
              onChange={(e) => update("birthDate", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail secundário</Label>
            <Input
              value={data.secondaryEmail || ""}
              onChange={(e) =>
                update("secondaryEmail", e.target.value)
              }
            />
          </div>

        </div>

        <div className="space-y-1.5">
          <Label>Resumo profissional</Label>
          <Textarea
            rows={5}
            value={data.professionalSummary || ""}
            onChange={(e) =>
              update("professionalSummary", e.target.value)
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Formação acadêmica</Label>
          <Textarea
            rows={6}
            value={data.education || ""}
            onChange={(e) =>
              update("education", e.target.value)
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Cursos e certificações</Label>
          <Textarea
            rows={5}
            value={data.courses || ""}
            onChange={(e) =>
              update("courses", e.target.value)
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Experiência profissional</Label>
          <Textarea
            rows={10}
            value={data.experience || ""}
            onChange={(e) =>
              update("experience", e.target.value)
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Habilidades</Label>
          <Textarea
            rows={4}
            value={
              Array.isArray(data.skills)
                ? data.skills.join(", ")
                : ""
            }
            onChange={(e) =>
              setData((current) => ({
                ...current,
                skills: e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Idiomas</Label>
          <Input
            value={
              Array.isArray(data.languages)
                ? data.languages.join(", ")
                : ""
            }
            onChange={(e) =>
              setData((current) => ({
                ...current,
                languages: e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="space-y-1.5">
            <Label>Pretensão salarial</Label>
            <Input
              type="number"
              step="0.01"
              value={
                data.salaryExpectation ?? ""
              }
              onChange={(e) =>
                setData((current) => ({
                  ...current,
                  salaryExpectation:
                    e.target.value === ""
                      ? null
                      : Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoria da CNH</Label>
            <Input
              value={data.driverLicenseCategory || ""}
              onChange={(e) =>
                update(
                  "driverLicenseCategory",
                  e.target.value
                )
              }
            />
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input
              value={data.address || ""}
              onChange={(e) =>
                update("address", e.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>País</Label>
            <Input
              value={data.country || ""}
              onChange={(e) =>
                update("country", e.target.value)
              }
            />
          </div>

        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t pt-4">

          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={
              pending ||
              !data.name?.trim() ||
              !data.email?.trim()
            }
            onClick={confirm}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}

            {pending
              ? "Cadastrando..."
              : "Confirmar cadastro"}
          </Button>

        </div>

      </CardContent>
    </Card>
  );
}
