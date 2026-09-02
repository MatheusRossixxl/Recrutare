"use client";

import * as React from "react";
import { Loader2, Upload, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Extraction = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  desiredRole?: string | null;
  desiredRoles?: string | null;
  professionalSummary?: string | null;
  summary?: string | null;
  birthDate?: string | null;
  secondaryEmail?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  education?: string | null;
  courses?: string | null;
  experience?: string | null;
  skills?: string[] | null;
  languages?: string[] | null;
  salaryExpectation?: number | null;
  hasDriverLicense?: boolean | null;
  driverLicenseCategory?: string | null;
  gender?: string | null;
  race?: string | null;
  sexualOrientation?: string | null;
  genderIdentity?: string | null;
  address?: string | null;
  country?: string | null;
};

function formatDateForInput(value?: string | null) {
  if (!value) return "";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function arrayToText(value?: string[] | null) {
  if (!value) return "";
  return value.join(", ");
}

function textToArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ResumeImportButton() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [extraction, setExtraction] = React.useState<Extraction | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  function updateField(
    field: keyof Extraction,
    value: string | number | boolean | null
  ) {
    setExtraction((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });
  }

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast({
        title: "Formato inválido",
        description: "Envie o currículo em PDF.",
        variant: "destructive",
      });

      e.target.value = "";
      return;
    }

    setPending(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/candidates/resume-import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Não foi possível processar o currículo."
        );
      }

      setFileName(data.fileName || file.name);
      setExtraction({
        ...data.extraction,
        birthDate: formatDateForInput(data.extraction?.birthDate),
      });

      setReviewOpen(true);

      toast({
        title: "Currículo processado!",
        description:
          "Confira os dados extraídos antes de cadastrar o candidato.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Erro ao importar currículo",
        description:
          err instanceof Error
            ? err.message
            : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setPending(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleConfirm() {
    if (!extraction) return;

    if (!extraction.name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do candidato antes de cadastrar.",
        variant: "destructive",
      });
      return;
    }

    if (!extraction.email?.trim()) {
      toast({
        title: "E-mail obrigatório",
        description: "Informe o e-mail do candidato antes de cadastrar.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const payload: Extraction = {
        ...extraction,
        name: extraction.name.trim(),
        email: extraction.email.trim().toLowerCase(),
        skills:
          typeof extraction.skills === "string"
            ? textToArray(extraction.skills)
            : extraction.skills,
        languages:
          typeof extraction.languages === "string"
            ? textToArray(extraction.languages)
            : extraction.languages,
      };

      const res = await fetch(
        "/api/candidates/resume-import/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName,
            extraction: payload,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Não foi possível cadastrar o candidato."
        );
      }

      toast({
        title: "Candidato cadastrado!",
        description:
          "Os dados revisados foram salvos com sucesso.",
        variant: "success",
      });

      setReviewOpen(false);
      setExtraction(null);
      setFileName("");

      router.push(`/candidates/${data.candidate.id}`);
    } catch (err) {
      toast({
        title: "Erro ao cadastrar candidato",
        description:
          err instanceof Error
            ? err.message
            : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setReviewOpen(false);
    setExtraction(null);
    setFileName("");
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={pending || saving}
      />

      <Button
        type="button"
        variant="outline"
        disabled={pending || saving}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}

        {pending ? "Processando..." : "Adicionar currículo"}
      </Button>

      {reviewOpen && extraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Revisar candidato
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Confira e corrija os dados extraídos do currículo antes de cadastrar.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Arquivo: {fileName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  Revisão rápida
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Os campos foram preenchidos automaticamente. Você pode corrigir
                  nomes, espaçamento, textos e qualquer informação antes de salvar.
                </p>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="mb-4 text-sm font-semibold">
                    Dados pessoais
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Nome completo</Label>
                      <Input
                        value={extraction.name || ""}
                        onChange={(e) =>
                          updateField("name", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={extraction.email || ""}
                        onChange={(e) =>
                          updateField("email", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>E-mail secundário</Label>
                      <Input
                        type="email"
                        value={extraction.secondaryEmail || ""}
                        onChange={(e) =>
                          updateField(
                            "secondaryEmail",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={extraction.phone || ""}
                        onChange={(e) =>
                          updateField("phone", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data de nascimento</Label>
                      <Input
                        type="date"
                        value={formatDateForInput(extraction.birthDate)}
                        onChange={(e) =>
                          updateField(
                            "birthDate",
                            e.target.value || null
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={extraction.city || ""}
                        onChange={(e) =>
                          updateField("city", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>País</Label>
                      <Input
                        value={extraction.country || ""}
                        onChange={(e) =>
                          updateField("country", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Endereço</Label>
                      <Input
                        value={extraction.address || ""}
                        onChange={(e) =>
                          updateField("address", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold">
                    Informações profissionais
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Cargo pretendido</Label>
                      <Input
                        value={extraction.desiredRole || ""}
                        onChange={(e) =>
                          updateField(
                            "desiredRole",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cargos de interesse</Label>
                      <Input
                        value={extraction.desiredRoles || ""}
                        onChange={(e) =>
                          updateField(
                            "desiredRoles",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Resumo profissional</Label>
                      <Textarea
                        rows={5}
                        value={
                          extraction.professionalSummary ||
                          extraction.summary ||
                          ""
                        }
                        onChange={(e) =>
                          updateField(
                            "professionalSummary",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Pretensão salarial</Label>
                      <Input
                        type="number"
                        value={
                          extraction.salaryExpectation ?? ""
                        }
                        onChange={(e) =>
                          updateField(
                            "salaryExpectation",
                            e.target.value
                              ? Number(e.target.value)
                              : null
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>CNH / Categoria</Label>
                      <Input
                        value={
                          extraction.driverLicenseCategory || ""
                        }
                        onChange={(e) =>
                          updateField(
                            "driverLicenseCategory",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold">
                    Formação e experiência
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Formação</Label>
                      <Textarea
                        rows={5}
                        value={extraction.education || ""}
                        onChange={(e) =>
                          updateField(
                            "education",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cursos</Label>
                      <Textarea
                        rows={4}
                        value={extraction.courses || ""}
                        onChange={(e) =>
                          updateField(
                            "courses",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Experiência profissional</Label>
                      <Textarea
                        rows={8}
                        value={extraction.experience || ""}
                        onChange={(e) =>
                          updateField(
                            "experience",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold">
                    Competências e informações adicionais
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Habilidades</Label>
                      <Input
                        value={arrayToText(extraction.skills)}
                        onChange={(e) =>
                          updateField(
                            "skills",
                            e.target.value
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Separe as habilidades por vírgula.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Idiomas</Label>
                      <Input
                        value={arrayToText(extraction.languages)}
                        onChange={(e) =>
                          updateField(
                            "languages",
                            e.target.value
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Separe os idiomas por vírgula.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input
                        value={extraction.linkedin || ""}
                        onChange={(e) =>
                          updateField(
                            "linkedin",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Portfólio</Label>
                      <Input
                        value={extraction.portfolio || ""}
                        onChange={(e) =>
                          updateField(
                            "portfolio",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t bg-muted/20 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}

                {saving
                  ? "Cadastrando..."
                  : "Confirmar e cadastrar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
