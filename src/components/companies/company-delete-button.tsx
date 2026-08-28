"use client";

import { Trash2 } from "lucide-react";

import { ConfirmActionButton } from "@/components/ui/confirm-action-button";

import { deleteCompany } from "@/lib/actions";

export function CompanyDeleteButton({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  return (
    <ConfirmActionButton
      variant="destructive"
      size="sm"
      title="Excluir empresa definitivamente?"
      description={`A empresa "${companyName}" será excluída definitivamente. Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir definitivamente"
      successMessage={`Empresa "${companyName}" excluída.`}
      action={() => deleteCompany(companyId)}
    >
      <Trash2 className="h-4 w-4" /> Excluir
    </ConfirmActionButton>
  );
}
