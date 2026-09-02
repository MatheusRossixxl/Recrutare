"use client";

import * as React from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddResumeButton() {
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange() {
    // A lógica de processamento do currículo será adicionada no próximo passo.
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
        disabled={pending}
      />

      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {pending ? "Processando..." : "Adicionar currículo"}
      </Button>
    </>
  );
}
