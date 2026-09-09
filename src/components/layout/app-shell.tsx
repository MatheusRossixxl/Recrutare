"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/command-palette/command-palette";

interface AppShellProps {
  userName: string;
  organizationName: string;
  children: React.ReactNode;
}

export function AppShell({
  userName,
  organizationName,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setMobileOpen(open);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onOpenChange={handleOpenChange} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userName={userName}
          organizationName={organizationName}
          notifications={[]}
        />

        <main className="animate-page flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
