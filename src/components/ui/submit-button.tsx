"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Botão de submit para formulários que usam Server Actions.
 * Mostra spinner + desabilita automaticamente enquanto a action roda,
 * usando useFormStatus (precisa estar dentro do <form>).
 */
export function SubmitButton({
  children,
  pendingText = "Salvando...",
  className,
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={cn(className)} {...props}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? pendingText : children}
    </Button>
  );
}
