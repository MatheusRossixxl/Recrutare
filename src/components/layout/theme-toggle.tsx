"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();
  const isDark = mounted && theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Ativar modo ${nextTheme === "dark" ? "escuro" : "claro"}`}
      aria-pressed={isDark}
      title={`Ativar modo ${nextTheme === "dark" ? "escuro" : "claro"}`}
      onClick={() => setTheme(nextTheme)}
      className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
