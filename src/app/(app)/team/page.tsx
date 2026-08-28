import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeactivateUserButton } from "@/components/team/deactivate-user-button";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await requireSession();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const status = searchParams.status || "active";

  const users = await db.user.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status === "active"
        ? { active: true }
        : status === "archived"
          ? { active: false }
          : {}),
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  async function reactivateUser(userId: string) {
    "use server";

    const currentUser = await requireSession();

    if (currentUser.role !== "ADMIN") {
      throw new Error("Você não tem permissão para realizar esta ação.");
    }

    const member = await db.user.findFirst({
      where: {
        id: userId,
        organizationId: currentUser.organizationId,
      },
    });

    if (!member) {
      throw new Error("Usuário não encontrado.");
    }

    await db.user.update({
      where: {
        id: member.id,
      },
      data: {
        active: true,
      },
    });

    redirect("/team?status=archived");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Equipe</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários e permissões da equipe.
          </p>
        </div>

        <Button asChild>
          <Link href="/team/new">
            Adicionar usuário
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === "all" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/team?status=all">Todos</Link>
        </Button>

        <Button
          variant={status === "active" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/team?status=active">Ativos</Link>
        </Button>

        <Button
          variant={status === "archived" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/team?status=archived">Arquivados</Link>
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {status === "archived"
              ? "Nenhum usuário arquivado."
              : "Nenhum usuário encontrado."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {member.name}
                    </CardTitle>

                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>

                  <Badge
                    variant={member.role === "ADMIN" ? "primary" : "default"}
                  >
                    {member.role === "ADMIN"
                      ? "Administrador"
                      : "Recrutador"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={member.active ? "success" : "destructive"}
                  >
                    {member.active ? "Ativo" : "Desativado"}
                  </Badge>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/team/${member.id}/edit`}>
                        Editar
                      </Link>
                    </Button>

                    {member.active ? (
                      <DeactivateUserButton userId={member.id} userName={member.name} />
                    ) : (
                      <form action={reactivateUser.bind(null, member.id)}>
                        <Button
                          type="submit"
                          variant="default"
                          size="sm"
                        >
                          Reativar
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
