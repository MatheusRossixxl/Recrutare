"use client";

import { UserMinus } from "lucide-react";

import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { removeCandidateFromJob } from "@/lib/actions";

export function CandidateJobRemoveButton({
  applicationId,
  candidateName,
  jobTitle,
}: {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
}) {
  return (
    <ConfirmActionButton
      variant="outline"
      size="sm"
      title="Remover candidato da vaga?"
      description={`"${candidateName}" será removido da vaga "${jobTitle}". O candidato continuará cadastrado no sistema.`}
      confirmLabel="Remover da vaga"
      successMessage={`"${candidateName}" foi removido da vaga.`}
      action={() => removeCandidateFromJob(applicationId)}
    >
      <UserMinus className="h-4 w-4" /> Remover
    </ConfirmActionButton>
  );
}
