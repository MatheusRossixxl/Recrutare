"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const currentPassword = String(
      form.get("currentPassword") || ""
    );
    const newPassword = String(
      form.get("newPassword") || ""
    );
    const confirmPassword = String(
      form.get("confirmPassword") || ""
    );

    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("As novas senhas não coincidem.");
      return;
    }

    setPending(true);

    try {
      await updatePassword({
        currentPassword,
        newPassword,
      });

      formElement.reset();
      setMessage("Senha alterada com sucesso.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current-password">
          Senha atual
        </Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password">
          Nova senha
        </Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          minLength={6}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">
          Confirmar nova senha
        </Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          minLength={6}
          required
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Alterando..." : "Alterar senha"}
      </Button>

      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}
