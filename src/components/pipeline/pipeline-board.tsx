"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import type { Application, Candidate, StageHistory } from "@prisma/client";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLOR, NOTE_REQUIRED_STAGES, type PipelineStage } from "@/lib/constants";
import { moveApplicationStage } from "@/lib/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { MoveStageDialog } from "./move-stage-dialog";

type ApplicationWithCandidate = Application & {
  candidate: Candidate;
  stageHistory?: StageHistory[];
};

export function PipelineBoard({ applications }: { applications: ApplicationWithCandidate[] }) {
  const [optimisticApps, setOptimisticApps] = useState(applications);
  // Diálogo de observação para drops em etapas que exigem nota.
  const [pendingMove, setPendingMove] = useState<{ appId: string; toStage: PipelineStage } | null>(null);

  useEffect(() => {
    setOptimisticApps(applications);
  }, [applications]);

  function handleDragEnd(result: DropResult) {
    const { destination, draggableId, source } = result;
    if (!destination) return;

    const newStage = destination.droppableId as PipelineStage;
    const app = optimisticApps.find((a) => a.id === draggableId);
    if (!app || app.stage === newStage) return;

    // Etapas que exigem observação: abre o mesmo dialog do botão
    // "Encaminhar". Nada muda até confirmar; cancelar mantém a etapa.
    // (Não toca no estado aqui: a lib de dnd reverte o placeholder sozinha.)
    if ((NOTE_REQUIRED_STAGES as readonly string[]).includes(newStage)) {
      setPendingMove({ appId: draggableId, toStage: newStage });
      return;
    }

    // Demais etapas: move direto, sem modal, sem observação.
    setOptimisticApps((state) =>
      state.map((a) => (a.id === draggableId ? { ...a, stage: newStage } : a))
    );

    moveApplicationStage(draggableId, newStage).catch(() => {
      setOptimisticApps(applications);
    });
  }

  const pendingApp = pendingMove ? optimisticApps.find((a) => a.id === pendingMove.appId) : null;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PIPELINE_STAGES.map((stage) => {
          const items = optimisticApps.filter((a) => a.stage === stage);
          return (
            <Droppable droppableId={stage} key={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex min-w-0 flex-col rounded-lg border border-border bg-muted/30 transition-colors ${
                    snapshot.isDraggingOver ? "border-primary/50 bg-accent/40 ring-1 ring-primary/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${PIPELINE_STAGE_COLOR[stage]}`} />
                      <span className="text-xs font-semibold">{PIPELINE_STAGE_LABELS[stage]}</span>
                    </div>
                    <span className="text-tabular text-xs text-muted-foreground">{items.length}</span>
                  </div>

                  <div className="flex-1 space-y-2 px-2 pb-2">
                    {items.map((app, index) => (
                      <PipelineCard key={app.id} app={app} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>

      {/* Confirmação com observação obrigatória (drop em etapa exigida).
          Mesmo MoveStageDialog do botão Encaminhar, montado já aberto com
          o destino pré-selecionado — sem ref, sem useEffect, sem timer. */}
      {pendingMove && pendingApp && (
        <MoveStageDialog
          key={`${pendingMove.appId}-${pendingMove.toStage}`}
          applicationId={pendingMove.appId}
          currentStage={pendingApp.stage as PipelineStage}
          candidateName={pendingApp.candidate.name}
          initialTargetStage={pendingMove.toStage}
          autoOpen
          hideTrigger
          onMoved={() => {
            setOptimisticApps((state) =>
              state.map((a) =>
                a.id === pendingMove.appId ? { ...a, stage: pendingMove.toStage } : a
              )
            );
            setPendingMove(null);
          }}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </DragDropContext>
  );
}

function PipelineCard({ app, index }: { app: ApplicationWithCandidate; index: number }) {

  // Observação exibida SOMENTE nas 3 etapas exigidas, a partir da última
  // nota registrada no histórico. Demais etapas: nada é renderizado.
  const showNote = (NOTE_REQUIRED_STAGES as readonly string[]).includes(app.stage);
  const latestNote = showNote
    ? app.stageHistory?.find((h) => h.toStage === app.stage && h.note)?.note ?? null
    : null;

  return (
    <Draggable draggableId={app.id} index={index} key={app.id}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          className={`cursor-grab rounded-md border border-border bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
            dragSnapshot.isDragging ? "shadow-lg ring-2 ring-ring" : ""
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">{initials(app.candidate.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/candidates/${app.candidateId}`} className="block truncate font-medium hover:underline">
                {app.candidate.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {app.candidate.city || "Cidade não informada"}
              </p>
            </div>
            <MoveStageDialog
              applicationId={app.id}
              currentStage={app.stage as PipelineStage}
              candidateName={app.candidate.name}
            />
          </div>
          {app.aiMatchScore !== null && app.aiMatchScore !== undefined && (
            <div className="mt-2 text-xs text-muted-foreground">
              Compatibilidade (IA): <span className="font-medium text-foreground">{app.aiMatchScore}%</span>
            </div>
          )}
          {latestNote && (
            <p className="mt-2 line-clamp-2 border-t border-border pt-2 text-xs text-muted-foreground" title={latestNote}>
              {latestNote}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
