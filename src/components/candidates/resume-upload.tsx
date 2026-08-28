"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ResumeUpload({ candidateId }: { candidateId: string }) {
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Formato inválido", description: "Envie o currículo em PDF.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    setPending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/candidates/${candidateId}/resume`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Não foi possível enviar o currículo.");
      }

      toast({
        title: "Currículo enviado!",
        description: data.resume?.aiSummary
          ? "O texto já foi extraído e analisado pela IA."
          : "O arquivo foi salvo com sucesso.",
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      toast({
        title: "Erro no upload",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-md border border-dashed border-border p-3 text-center">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        id="resume-upload-input"
        onChange={handleFileChange}
        disabled={pending}
      />
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {pending ? "Enviando..." : "Enviar currículo (PDF)"}
      </Button>
      <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <FileText className="h-3 w-3" /> Máximo 10MB — o texto é extraído e analisado automaticamente
      </p>
    </div>
  );
}
