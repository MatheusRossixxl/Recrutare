"use client";

import { useState } from "react";
import Link from "next/link";
import { X, MapPin, Clock, User, Briefcase, Video, Phone, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InterviewData } from "./calendar-view";
import { ReminderSettings } from "./reminder-settings";

interface EventCardProps {
  interview: InterviewData;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Vídeo",
  PHONE: "Telefone",
  IN_PERSON: "Presencial",
  TECHNICAL: "Técnica",
};

const TYPE_ICONS: Record<string, typeof Video> = {
  VIDEO: Video,
  PHONE: Phone,
  IN_PERSON: Users,
  TECHNICAL: Wrench,
};

export function EventCard({ interview, onClose }: EventCardProps) {
  const date = new Date(interview.scheduledAt);
  const dateStr = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const TypeIcon = TYPE_ICONS[interview.type] || Video;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold">Detalhes da Entrevista</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {interview.status === "SCHEDULED" ? "Agendada" : "Reagendada"}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4 px-6 py-4">
            {/* Candidato */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  <Link href={`/candidates/${interview.candidate.id}`} className="hover:underline">
                    {interview.candidate.name.split(" ")[0]}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">{interview.candidate.email}</p>
              </div>
            </div>

            {/* Vaga */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  <Link href={`/jobs/${interview.job.id}`} className="hover:underline">
                    {interview.job.title}
                  </Link>
                </p>
              </div>
            </div>

            {/* Data/Hora */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{dateStr}</p>
                <p className="text-xs text-muted-foreground">{timeStr}</p>
              </div>
            </div>

            {/* Tipo */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <TypeIcon className="h-4 w-4" />
              </div>
              <div>
                <Badge variant="default">{TYPE_LABELS[interview.type] || interview.type}</Badge>
              </div>
            </div>

            {/* Link de reunião */}
            {interview.meetingLink && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {interview.meetingLink}
                  </a>
                </div>
              </div>
            )}

            {/* Notas */}
            {interview.notes && (
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
                <p className="text-sm whitespace-pre-line">{interview.notes}</p>
              </div>
            )}

            {/* Lembrete */}
            <ReminderSettings
              interviewId={interview.id}
              currentMinutes={interview.reminderMinutes}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/interviews/${interview.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
