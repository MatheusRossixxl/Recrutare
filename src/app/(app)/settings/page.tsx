import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { OrganizationForm } from "@/components/settings/organization-form";
import { PasswordForm } from "@/components/settings/password-form";

export default async function SettingsPage() {
  const sessionUser = await requireSession();

  const user = await db.user.findFirst({
    where: {
      id: sessionUser.id,
      organizationId: sessionUser.organizationId,
      active: true,
    },
  });

  if (!user) {
    throw new Error("Usuário não encontrado ou desativado.");
  }

  const organization = await db.organization.findUnique({
    where: { id: sessionUser.organizationId },
  });

  if (!organization) {
    throw new Error("Organização não encontrada.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie seu perfil e as informações da organização.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meu perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            name={user.name}
            email={user.email}
          />
        </CardContent>
      </Card>

      {user.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle>Organização</CardTitle>
          </CardHeader>
          <CardContent>
            <OrganizationForm
              name={organization.name}
              slug={organization.slug}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
