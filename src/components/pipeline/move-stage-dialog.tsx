"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  NOTE_REQUIRED_STAGES,
  DISQUALIFICATION_TYPES,
  type PipelineStage,
} from "@/lib/constants";
import { moveApplicationStage } from "@/lib/actions";

export interface MoveStageDialogHandle {
  openWithStage: (target: PipelineStage) => void;
}

interface MoveStageDialogProps {
  applicationId: string;
  currentStage: PipelineStage;
  candidateName: string;
  onMoved?: () => void;
  onCancel?: () => void;
  // Abertura declarativa (usada pelo drag-and-drop): já monta aberto
  // com a etapa destino pré-selecionada, sem depender de ref/useEffect.
  initialTargetStage?: PipelineStage;
  autoOpen?: boolean;
  hideTrigger?: boolean;
}

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const MoveStageDialog = forwardRef<MoveStageDialogHandle, MoveStageDialogProps>(
  function MoveStageDialog({ applicationId, currentStage, candidateName, onMoved, onCancel, initialTargetStage, autoOpen, hideTrigger }, ref) {
    const [open, setOpen] = useState(!!autoOpen);
    const [targetStage, setTargetStage] = useState<PipelineStage | "">(initialTargetStage ?? "");
    const [note, setNote] = useState("");
    const [disqualificationType, setDisqualificationType] = useState("");
    const [occurredAt, setOccurredAt] = useState(toLocalDateTimeString(new Date()));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isDisqualification = (targetStage as string) === "DISQUALIFICATION";
    const requiresNote = targetStage ? (NOTE_REQUIRED_STAGES as readonly string[]).includes(targetStage) : false;

    const availableStages = PIPELINE_STAGES.filter((s) => s !== currentStage);

    function resetForm() {
      setTargetStage("");
      setNote("");
      setDisqualificationType("");
      setOccurredAt(toLocalDateTimeString(new Date()));
      setError("");
    }

    function handleOpen() {
      resetForm();
      setOpen(true);
    }

    useImperativeHandle(ref, () => ({
      openWithStage(target: PipelineStage) {
        resetForm();
        setTargetStage(target);
        setOpen(true);
      },
    }));

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!targetStage) return;

      // Observação obrigatória para Desclassificação, Reprovação e Desistência.
      if (requiresNote && !note.trim()) {
        setError("Observação obrigatória para esta etapa.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        await moveApplicationStage(
          applicationId,
          targetStage as PipelineStage,
          requiresNote ? note.trim() : undefined
        );
        setOpen(false);
        onMoved?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao mover candidato.");
      } finally {
        setLoading(false);
      }
    }

    return (
      <>
        {!hideTrigger && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleOpen}
            title="Mover para outra etapa"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}

        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) onCancel?.();
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Mover {candidateName}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select de etapa destino */}
              <div className="space-y-1.5">
                <Label>Etapa destino</Label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as PipelineStage | "")}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Selecione a etapa...</option>
                  {availableStages.map((s) => (
                    <option key={s} value={s}>
                      {PIPELINE_STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desclassificação: select de motivo */}
              {isDisqualification && (
                <div className="space-y-1.5">
                  <Label>Tipo de desclassificação *</Label>
                  <select
                    value={disqualificationType}
                    onChange={(e) => setDisqualificationType(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Selecione o motivo...</option>
                    {DISQUALIFICATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Etapas que exigem observação: campo obrigatório único */}
              {requiresNote && (
                <div className="space-y-1.5">
                  <Label>Observação *</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    required
                    placeholder="Descreva o motivo (obrigatório)..."
                  />
                </div>
              )}

              {/* Data/hora */}
              {targetStage && (
                <div className="space-y-1.5">
                  <Label>Data/hora da ocorrência</Label>
                  <Input
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <SubmitButton pendingText="Movendo..." disabled={!targetStage || loading}>
                  Confirmar
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);
