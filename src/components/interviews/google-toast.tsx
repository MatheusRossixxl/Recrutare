"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function GoogleToast() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (googleStatus === "connected") {
      toast({
        title: "Google Calendar conectado!",
        description: "Suas entrevistas serão sincronizadas automaticamente.",
        variant: "success",
      });
      window.history.replaceState({}, "", "/interviews");
    } else if (googleStatus === "error") {
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar ao Google Calendar. Tente novamente.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/interviews");
    } else if (googleStatus === "disconnected") {
      toast({
        title: "Google Calendar desconectado",
        description: "A integração com o Google Calendar foi removida.",
      });
      window.history.replaceState({}, "", "/interviews");
    }
  }, [searchParams, toast]);

  return null;
}
