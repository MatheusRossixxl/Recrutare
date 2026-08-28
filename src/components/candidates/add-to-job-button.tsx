"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCandidateToJob } from "@/lib/actions";

export function AddToJobButton({
  candidateId,
  jobId,
  alreadyAdded = false,
}: {
  candidateId: string;
  jobId: string;
  alreadyAdded?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleAdd() {
    setPending(true);

    try {
      await addCandidateToJob(candidateId, jobId);
      router.push(`/jobs/${jobId}`);
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o candidato."
      );
      setPending(false);
    }
  }

  if (alreadyAdded) {
    return (
      <Button type="button" size="sm" variant="outline" disabled>
        <Check className="h-4 w-4" />
        Já adicionado
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      onClick={handleAdd}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {pending ? "Adicionando..." : "Adicionar à vaga"}
    </Button>
  );
}
