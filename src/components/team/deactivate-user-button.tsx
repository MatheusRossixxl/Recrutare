"use client";

import { UserX } from "lucide-react";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { deactivateUser } from "@/lib/actions";

export function DeactivateUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return (
    <ConfirmActionButton
      variant="destructive"
      size="sm"
      title="Desativar usuário?"
      description={`${userName} será desativado e não poderá mais acessar o sistema. O usuário não será excluído e poderá ser reativado posteriormente.`}
      confirmLabel="Desativar"
      successMessage={`Usuário "${userName}" desativado com sucesso.`}
      action={() => deactivateUser(userId)}
    >
      <UserX className="h-4 w-4" />
      Desativar
    </ConfirmActionButton>
  );
}
