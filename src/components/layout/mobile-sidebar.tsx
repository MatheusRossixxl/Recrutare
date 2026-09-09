"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>

        <div className="flex h-[72px] items-center border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-sm">
              R
            </div>
            <div className="leading-none">
              <div className="text-[15px] font-bold tracking-tight text-foreground">
                Recrutare
              </div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Gestão de talentos
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          <div className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Gestão
          </div>

          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-[17px] w-[17px] shrink-0 transition-transform duration-200",
                    !active && "group-hover:scale-105"
                  )}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Sistema
          </div>

          <Link
            href="/search"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              pathname === "/search"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Search className="h-[17px] w-[17px]" strokeWidth={1.8} />
            Buscar
          </Link>

          <Link
            href="/settings"
            className={cn(
              "mt-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              pathname === "/settings"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="h-[17px] w-[17px]" strokeWidth={1.8} />
            Configurações
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
