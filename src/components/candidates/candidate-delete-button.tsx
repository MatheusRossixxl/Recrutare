"use client";

import { Trash2 } from "lucide-react";

import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { deleteCandidate } from "@/lib/actions";

export function CandidateDeleteButton({
  candidateId,
  candidateName,
}: {
  candidateId: string;
  candidateName: string;
}) {
  return (
    <ConfirmActionButton
      variant="destructive"
      size="sm"
      title="Excluir candidato definitivamente?"
      description={`O candidato "${candidateName}" será excluído definitivamente. Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir definitivamente"
      successMessage={`Candidato "${candidateName}" excluído.`}
      redirectOnSuccess="/candidates"
      action={() => deleteCandidate(candidateId)}
    >
      <Trash2 className="h-4 w-4" /> Excluir
    </ConfirmActionButton>
  );
}
