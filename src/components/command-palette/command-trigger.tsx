"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandTriggerProps {
  onClick?: () => void;
}

export function CommandTrigger({ onClick }: CommandTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="hidden h-9 gap-2 rounded-xl border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Buscar</span>
    </Button>
  );
}