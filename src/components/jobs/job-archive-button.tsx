"use client";

import { Archive, ArchiveRestore } from "lucide-react";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { archiveJob, restoreJob } from "@/lib/actions";

export function JobArchiveButton({
  jobId,
  jobTitle,
  activeApplicationsCount,
}: {
  jobId: string;
  jobTitle: string;
  activeApplicationsCount: number;
}) {
  return (
    <ConfirmActionButton
      variant="destructive"
      size="sm"
      title="Arquivar vaga?"
      description={
        activeApplicationsCount > 0
          ? `A vaga "${jobTitle}" possui ${activeApplicationsCount} candidatura(s) em andamento. A vaga não será excluída — apenas arquivada, deixando de aparecer na listagem padrão. Candidaturas e entrevistas continuam intactas e você pode restaurá-la a qualquer momento.`
          : `A vaga "${jobTitle}" será arquivada e deixará de aparecer na listagem padrão. Nenhum dado é excluído — você pode restaurá-la a qualquer momento.`
      }
      confirmLabel="Arquivar"
      successMessage={`Vaga "${jobTitle}" arquivada.`}
      action={() => archiveJob(jobId)}
    >
      <Archive className="h-4 w-4" /> Arquivar
    </ConfirmActionButton>
  );
}

export function JobRestoreButton({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  return (
    <ConfirmActionButton
      variant="secondary"
      size="sm"
      title="Restaurar vaga?"
      description={`"${jobTitle}" voltará a aparecer normalmente nas listagens e buscas.`}
      confirmLabel="Restaurar"
      successMessage={`Vaga "${jobTitle}" restaurada.`}
      action={() => restoreJob(jobId)}
    >
      <ArchiveRestore className="h-4 w-4" /> Restaurar
    </ConfirmActionButton>
  );
}
