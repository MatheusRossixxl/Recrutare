"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ConfirmActionButtonProps extends ButtonProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Server action (ou qualquer função assíncrona) a ser executada na confirmação. */
  action: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  /** Se true, atualiza a rota atual (router.refresh) após sucesso, em vez de depender apenas do revalidatePath da action. */
  refreshOnSuccess?: boolean;

  /** Rota opcional para navegar após a ação ser concluída com sucesso. */
  redirectOnSuccess?: string;
}

/**
 * Botão genérico para ações destrutivas ou sensíveis (arquivar, excluir,
 * cancelar, restaurar). Abre um diálogo de confirmação, mostra loading
 * durante a execução e dispara toast de sucesso/erro ao final.
 */
export function ConfirmActionButton({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  action,
  successMessage = "Ação realizada com sucesso.",
  errorMessage = "Não foi possível concluir a ação.",
  refreshOnSuccess = true,
  redirectOnSuccess,
  children,
  variant = "destructive",
  ...buttonProps
}: ConfirmActionButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleConfirm() {
    setPending(true);
    try {
      await action();
      setOpen(false);
      toast({ title: "Pronto!", description: successMessage, variant: "success" });
      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
      } else if (refreshOnSuccess) {
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Ops, algo deu errado",
        description: err instanceof Error ? err.message : errorMessage,
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} {...buttonProps}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            className={buttonProps.className}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Processando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
