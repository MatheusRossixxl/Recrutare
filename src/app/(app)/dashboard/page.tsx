import Link from "next/link";
import { Briefcase, Users, CalendarClock, KanbanSquare, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLOR, JOB_STATUS_LABELS } from "@/lib/constants";
import { StageChart } from "@/components/dashboard/stage-chart";
import { JobStatusChart } from "@/components/dashboard/job-status-chart";

export default async function DashboardPage() {
  const user = await requireSession();
  const organizationId = user.organizationId;

  const [openJobs, totalCandidates, upcomingInterviews, inProcessApplications, hiredThisYear, stageGroups, jobStatusGroups, recentActivities] =
    await Promise.all([
      db.job.count({ where: { organizationId, archived: false, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      db.candidate.count({ where: { organizationId, archived: false } }),
      db.interview.count({
        where: { organizationId, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
      }),
      db.application.count({
        where: { job: { organizationId, archived: false }, stage: { notIn: ["HIRED", "REJECTED"] } },
      }),
      db.application.count({
        where: {
          job: { organizationId, archived: false },
          stage: "HIRED",
          updatedAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
        },
      }),
      db.application.groupBy({
        by: ["stage"],
        where: { job: { organizationId, archived: false } },
        _count: { _all: true },
      }),
      db.job.groupBy({
        by: ["status"],
        where: { organizationId, archived: false },
        _count: { _all: true },
      }),
      db.activity.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const cards = [
    { label: "Vagas abertas", value: openJobs, icon: Briefcase, href: "/jobs" },
    { label: "Candidatos cadastrados", value: totalCandidates, icon: Users, href: "/candidates" },
    { label: "Entrevistas próximas", value: upcomingInterviews, icon: CalendarClock, href: "/interviews" },
    { label: "Candidatos em processo", value: inProcessApplications, icon: KanbanSquare, href: "/pipeline" },
    { label: "Contratações no ano", value: hiredThisYear, icon: CheckCircle2, href: "/pipeline" },
  ];

  const stageData = stageGroups.map((g) => ({
    name: PIPELINE_STAGE_LABELS[g.stage] ?? g.stage,
    value: g._count._all,
    color: PIPELINE_STAGE_COLOR[g.stage],
  }));

  const jobStatusData = jobStatusGroups.map((g) => ({
    name: JOB_STATUS_LABELS[g.status] ?? g.status,
    value: g._count._all,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between pt-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <p className="text-tabular mt-1 text-2xl font-semibold">{card.value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <card.icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Candidatos por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <StageChart data={stageData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vagas por status</CardTitle>
          </CardHeader>
          <CardContent>
            <JobStatusChart data={jobStatusData} />
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
