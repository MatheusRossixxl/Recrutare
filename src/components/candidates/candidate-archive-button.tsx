"use client";

import { Archive, ArchiveRestore } from "lucide-react";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { archiveCandidate, restoreCandidate } from "@/lib/actions";

export function CandidateArchiveButton({
  candidateId,
  candidateName,
  activeApplicationsCount,
}: {
  candidateId: string;
  candidateName: string;
  activeApplicationsCount: number;
}) {
  return (
    <ConfirmActionButton
      variant="destructive"
      size="sm"
      title="Arquivar candidato?"
      description={
        activeApplicationsCount > 0
          ? `${candidateName} possui ${activeApplicationsCount} candidatura(s) em andamento. O candidato não será excluído — apenas arquivado, deixando de aparecer na listagem padrão. Todo o histórico de candidaturas e entrevistas é preservado e você pode restaurá-lo a qualquer momento.`
          : `${candidateName} será arquivado e deixará de aparecer na listagem padrão. Nenhum dado é excluído — você pode restaurá-lo a qualquer momento.`
      }
      confirmLabel="Arquivar"
      successMessage={`Candidato "${candidateName}" arquivado.`}
      action={() => archiveCandidate(candidateId)}
    >
      <Archive className="h-4 w-4" /> Arquivar
    </ConfirmActionButton>
  );
}

export function CandidateRestoreButton({ candidateId, candidateName }: { candidateId: string; candidateName: string }) {
  return (
    <ConfirmActionButton
      variant="secondary"
      size="sm"
      title="Restaurar candidato?"
      description={`${candidateName} voltará a aparecer normalmente nas listagens e buscas.`}
      confirmLabel="Restaurar"
      successMessage={`Candidato "${candidateName}" restaurado.`}
      action={() => restoreCandidate(candidateId)}
    >
      <ArchiveRestore className="h-4 w-4" /> Restaurar
    </ConfirmActionButton>
  );
}
