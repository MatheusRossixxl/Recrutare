"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const newName = String(form.get("name") || "");
    const newEmail = String(form.get("email") || "");

    setPending(true);
    setMessage("");

    try {
      await updateProfile({
        name: newName,
        email: newEmail,
      });

      setMessage("Perfil atualizado com sucesso.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o perfil."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Nome</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={name}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          name="email"
          type="email"
          defaultValue={email}
          required
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>

      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}
