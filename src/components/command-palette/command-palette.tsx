"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  KanbanSquare,
  CalendarClock,
  CalendarDays,
  BarChart3,
  UserCog,
  Search,
  Plus,
  Settings,
} from "lucide-react";

interface SearchResult {
  jobs: { id: string; title: string; company: { name: string } }[];
  candidates: { id: string; name: string; city: string | null }[];
  companies: { id: string; name: string }[];
}

const NAV_COMMANDS = [
  { id: "nav-dashboard", label: "Painel", icon: LayoutDashboard, href: "/dashboard" },
  { id: "nav-companies", label: "Empresas", icon: Building2, href: "/companies" },
  { id: "nav-jobs", label: "Vagas", icon: Briefcase, href: "/jobs" },
  { id: "nav-pipeline", label: "Pipeline", icon: KanbanSquare, href: "/pipeline" },
  { id: "nav-candidates", label: "Candidatos", icon: Users, href: "/candidates" },
  { id: "nav-interviews", label: "Entrevistas", icon: CalendarClock, href: "/interviews" },
  { id: "nav-agenda", label: "Agenda", icon: CalendarDays, href: "/agenda" },
  { id: "nav-reports", label: "Relatórios", icon: BarChart3, href: "/reports" },
  { id: "nav-team", label: "Equipe", icon: UserCog, href: "/team" },
  { id: "nav-settings", label: "Configurações", icon: Settings, href: "/settings" },
];

const ACTION_COMMANDS = [
  { id: "action-new-job", label: "Criar vaga", icon: Plus, href: "/jobs/new" },
  { id: "action-new-candidate", label: "Criar candidato", icon: Plus, href: "/candidates/new" },
  { id: "action-new-interview", label: "Criar entrevista", icon: Plus, href: "/interviews/new" },
  { id: "action-search", label: "Buscar", icon: Search, href: "/search" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  useEffect(() => {
    if (!search.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setSearch("");
      setResults(null);
      router.push(href);
    },
    [router]
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Busca e navegação"
      className="fixed inset-0 z-[100] mx-auto mt-[20vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      overlayClassName="fixed inset-0 z-[99] bg-black/50"
    >
      <div className="flex items-center border-b border-border px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar vagas, candidatos ou navegar..."
          className="flex h-12 w-full bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <Command.List className="max-h-[300px] overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
          {loading ? "Buscando..." : "Nenhum resultado encontrado."}
        </Command.Empty>

        {/* Dynamic search results */}
        {results && (
          <>
            {results.jobs.length > 0 && (
              <Command.Group heading="Vagas" className="px-2 py-1">
                {results.jobs.map((job) => (
                  <Command.Item
                    key={job.id}
                    value={`job-${job.id}`}
                    onSelect={() => handleSelect(`/jobs/${job.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none data-[selected=true]:bg-muted"
                  >
                    <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{job.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.company.name}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.candidates.length > 0 && (
              <Command.Group heading="Candidatos" className="px-2 py-1">
                {results.candidates.map((candidate) => (
                  <Command.Item
                    key={candidate.id}
                    value={`candidate-${candidate.id}`}
                    onSelect={() => handleSelect(`/candidates/${candidate.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none data-[selected=true]:bg-muted"
                  >
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{candidate.name}</p>
                      {candidate.city && (
                        <p className="truncate text-xs text-muted-foreground">
                          {candidate.city}
                        </p>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.companies && results.companies.length > 0 && (
              <Command.Group heading="Empresas" className="px-2 py-1">
                {results.companies.map((company) => (
                  <Command.Item
                    key={company.id}
                    value={`company-${company.id}`}
                    onSelect={() => handleSelect(`/companies/${company.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none data-[selected=true]:bg-muted"
                  >
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{company.name}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </>
        )}

        {/* Static commands (only when no search or no results) */}
        {!search.trim() && (
          <>
            <Command.Group heading="Navegação" className="px-2 py-1">
              {NAV_COMMANDS.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => handleSelect(cmd.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none data-[selected=true]:bg-muted"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{cmd.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group heading="Ações rápidas" className="px-2 py-1">
              {ACTION_COMMANDS.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => handleSelect(cmd.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none data-[selected=true]:bg-muted"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{cmd.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </>
        )}
      </Command.List>
    </Command.Dialog>
  );
}