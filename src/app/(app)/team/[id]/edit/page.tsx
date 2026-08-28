import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function EditTeamMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireSession();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const member = await db.user.findFirst({
    where: {
      id: params.id,
      organizationId: user.organizationId,
    },
  });

  if (!member) {
    notFound();
  }

  async function updateUser(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "RECRUITER");

    if (!name || !email) {
      throw new Error("Nome e email são obrigatórios.");
    }

    if (role !== "ADMIN" && role !== "RECRUITER") {
      throw new Error("Função inválida.");
    }

    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: {
          id: params.id,
        },
      },
    });

    if (existingUser) {
      throw new Error("Este email já está sendo usado.");
    }

    const data: {
      name: string;
      email: string;
      role: string;
      passwordHash?: string;
    } = {
      name,
      email,
      role,
    };

    if (password) {
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      data.passwordHash = await bcrypt.hash(password, 10);
    }

    await db.user.update({
      where: {
        id: params.id,
      },
      data,
    });

    redirect("/team");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Editar usuário</h2>
        <p className="text-sm text-muted-foreground">
          Altere os dados e as permissões deste membro da equipe.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do usuário</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={updateUser} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                defaultValue={member.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={member.email}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Nova senha
              </Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Deixe vazio para manter a atual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>

              <select
                id="role"
                name="role"
                defaultValue={member.role}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="RECRUITER">Recrutador</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/team">Cancelar</Link>
              </Button>

              <Button type="submit">
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
