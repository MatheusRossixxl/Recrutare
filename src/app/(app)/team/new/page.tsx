import Link from "next/link";

import { redirect } from "next/navigation";

import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

import { requireSession } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

export default async function NewTeamMemberPage() {
  const user = await requireSession();

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  async function createUser(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "RECRUITER");

    if (!name || !email || !password) {
      throw new Error("Preencha todos os campos obrigatórios.");
    }

    if (password.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    if (role !== "ADMIN" && role !== "RECRUITER") {
      throw new Error("Função inválida.");
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Este email já está cadastrado.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        organizationId: user.organizationId,
        active: true,
      },
    });

    redirect("/team");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Novo usuário</h2>
        <p className="text-sm text-muted-foreground">
          Adicione um novo membro à equipe.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do usuário</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createUser} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha inicial</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo de 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>

              <select
                id="role"
                name="role"
                defaultValue="RECRUITER"
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
                Criar usuário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

