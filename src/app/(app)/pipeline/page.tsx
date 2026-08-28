import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { KanbanSquare } from "lucide-react";
import Link from "next/link";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { JobFilter } from "@/components/pipeline/job-filter";

export default async function PipelinePage({ searchParams }: { searchParams: { jobId?: string } }) {
  const user = await requireSession();

  const jobs = await db.job.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
    include: { company: true },
  });

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={KanbanSquare}
        title="Nenhuma vaga cadastrada ainda."
        description="Crie uma vaga para começar a organizar candidatos no pipeline."
        action={
          <Button asChild size="sm">
            <Link href="/jobs/new">Criar vaga</Link>
          </Button>
        }
      />
    );
  }

  const activeJobId = searchParams.jobId && jobs.some((j) => j.id === searchParams.jobId) ? searchParams.jobId : jobs[0].id;

  const applications = await db.application.findMany({
    where: { jobId: activeJobId },
    include: { candidate: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pipeline de candidatos</h2>
          <p className="text-sm text-muted-foreground">Arraste os candidatos entre as etapas do processo seletivo.</p>
        </div>
        <JobFilter jobs={jobs} activeJobId={activeJobId} />
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="Nenhum candidato nesta vaga ainda."
          description="Adicione candidatos a esta vaga para começar a organizá-los no pipeline."
          action={
            <Button asChild size="sm">
              <Link href={`/candidates/new?jobId=${activeJobId}`}>Adicionar candidato</Link>
            </Button>
          }
        />
      ) : (
        <PipelineBoard applications={applications} />
      )}
    </div>
  );
}
