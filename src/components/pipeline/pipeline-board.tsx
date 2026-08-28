"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import type { Application, Candidate } from "@prisma/client";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLOR, type PipelineStage } from "@/lib/constants";
import { moveApplicationStage } from "@/lib/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

type ApplicationWithCandidate = Application & { candidate: Candidate };

export function PipelineBoard({ applications }: { applications: ApplicationWithCandidate[] }) {
  // Estado local para refletir o drag-and-drop imediatamente na tela
  // (atualização otimista), sincronizado sempre que o servidor reenvia dados novos.
  const [optimisticApps, setOptimisticApps] = useState(applications);

  useEffect(() => {
    setOptimisticApps(applications);
  }, [applications]);

  function handleDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStage = destination.droppableId as PipelineStage;

    setOptimisticApps((state) => state.map((a) => (a.id === draggableId ? { ...a, stage: newStage } : a)));

    moveApplicationStage(draggableId, newStage).catch(() => {
      // Em caso de falha, volta ao estado anterior recarregando os dados originais.
      setOptimisticApps(applications);
    });
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const items = optimisticApps.filter((a) => a.stage === stage);
          return (
            <Droppable droppableId={stage} key={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex w-64 shrink-0 flex-col rounded-lg border border-border bg-muted/30 ${
                    snapshot.isDraggingOver ? "bg-accent/40" : ""
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
                      <Draggable draggableId={app.id} index={index} key={app.id}>
                        {(dragProvided, dragSnapshot) => (
                          <Link
                            href={`/candidates/${app.candidateId}`}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`block rounded-md border border-border bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow-md ${
                              dragSnapshot.isDragging ? "shadow-lg ring-2 ring-ring" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-[10px]">{initials(app.candidate.name)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{app.candidate.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {app.candidate.city || "Cidade não informada"}
                                </p>
                              </div>
                            </div>
                            {app.aiMatchScore !== null && app.aiMatchScore !== undefined && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Compatibilidade (IA): <span className="font-medium text-foreground">{app.aiMatchScore}%</span>
                              </div>
                            )}
                          </Link>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
