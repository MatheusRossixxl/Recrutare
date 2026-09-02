 "use client";

import * as React from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function ResumeUploadGeneral() {
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

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

      const res = await fetch("/api/candidates/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Não foi possível processar o currículo."
        );
      }

      toast({
        title: "Currículo processado!",
        description:
          "O candidato foi criado automaticamente a partir do currículo.",
        variant: "success",
      });

      router.refresh();
    } catch (err) {
      toast({
        title: "Erro no currículo",
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

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={pending}
      />

      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}

        {pending ? "Processando..." : "Adicionar currículo"}
      </Button>
    </>
  );
}
