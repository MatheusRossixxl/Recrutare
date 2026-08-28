"use client";

import { useState } from "react";
import { updateOrganization } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrganizationForm({
  name,
  slug,
}: {
  name: string;
  slug: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      await updateOrganization({
        name: String(form.get("name") || ""),
        slug: String(form.get("slug") || ""),
      });

      setMessage("Organização atualizada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="organization-name">Nome</Label>
        <Input id="organization-name" name="name" defaultValue={name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="organization-slug">Slug</Label>
        <Input id="organization-slug" name="slug" defaultValue={slug} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar organização"}
      </Button>

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </form>
  );
}
