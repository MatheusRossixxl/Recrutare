"use client";

import { Archive, ArchiveRestore } from "lucide-react";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { archiveCompany, restoreCompany } from "@/lib/actions";

export function CompanyArchiveButton({
  companyId,
  companyName,
  activeJobsCount,
}: {
  companyId: string;
  companyName: string;
  activeJobsCount: number;
}) {
  return (
    <ConfirmActionButton
      variant="outline"
      size="sm"
      title="Arquivar empresa?"
      description={
        activeJobsCount > 0
          ? `"${companyName}" possui ${activeJobsCount} vaga(s) ainda ativa(s). A empresa e suas vagas não serão excluídas do banco — apenas arquivadas, deixando de aparecer na listagem padrão. Você pode restaurá-la a qualquer momento.`
          : `"${companyName}" será arquivada e deixará de aparecer na listagem padrão. Nenhum dado é excluído — você pode restaurá-la a qualquer momento.`
      }
      confirmLabel="Arquivar"
      successMessage={`Empresa "${companyName}" arquivada.`}
      action={() => archiveCompany(companyId)}
    >
      <Archive className="h-4 w-4" /> Arquivar
    </ConfirmActionButton>
  );
}

export function CompanyRestoreButton({ companyId, companyName }: { companyId: string; companyName: string }) {
  return (
    <ConfirmActionButton
      variant="secondary"
      size="sm"
      title="Restaurar empresa?"
      description={`"${companyName}" voltará a aparecer normalmente nas listagens e buscas.`}
      confirmLabel="Restaurar"
      successMessage={`Empresa "${companyName}" restaurada.`}
      action={() => restoreCompany(companyId)}
    >
      <ArchiveRestore className="h-4 w-4" /> Restaurar
    </ConfirmActionButton>
  );
}
