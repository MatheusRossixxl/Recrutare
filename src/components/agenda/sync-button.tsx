"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  async function handleSync() {
    setSyncing(true);
    try {
      const response = await fetch("/api/google/sync", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Sincronização falhou",
          description: data.error || "Não foi possível sincronizar. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const parts: string[] = [];
      if (data.created > 0) parts.push(`${data.created} criado(s)`);
      if (data.updated > 0) parts.push(`${data.updated} atualizado(s)`);
      if (data.skipped > 0) parts.push(`${data.skipped} ignorado(s)`);

      toast({
        title: "Sincronização concluída",
        description: parts.length > 0 ? parts.join(" · ") : "Nada a sincronizar.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Sincronização falhou",
        description: "Erro de rede. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="gap-1.5">
      <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Sincronizando..." : "Sincronizar"}
    </Button>
  );
}
