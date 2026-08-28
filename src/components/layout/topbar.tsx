 "use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { NotificationBell } from "@/components/layout/notification-bell";

const TITLES: Record<string, string> = {
  "/dashboard": "Painel",
  "/companies": "Empresas",
  "/jobs": "Vagas",
  "/pipeline": "Pipeline",
  "/candidates": "Candidatos",
  "/interviews": "Entrevistas",
  "/search": "Buscar",
  "/settings": "Configurações",
  "/team": "Equipe",
};

function resolveTitle(pathname: string) {
  const match = Object.keys(TITLES).find(
    (key) => pathname === key || pathname.startsWith(key + "/")
  );

  return match ? TITLES[match] : "Recrutare";
}

export function Topbar({
  userName,
  organizationName,
  notifications,
}: {
  userName: string;
  organizationName: string;
  notifications: {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
}) {
  const pathname = usePathname() || "";
  const pageTitle = resolveTitle(pathname);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-sm font-semibold">{pageTitle}</h1>
        <p className="text-xs text-muted-foreground">{organizationName}</p>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} />

        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>{initials(userName)}</AvatarFallback>
          </Avatar>

          <span className="hidden text-sm font-medium sm:inline">
            {userName}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Sair"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
