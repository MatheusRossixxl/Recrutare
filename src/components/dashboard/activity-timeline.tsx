import {
  Building2,
  Briefcase,
  Users,
  KanbanSquare,
  CalendarClock,
  CheckCircle,
  XCircle,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
  user?: { name: string } | null;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Briefcase,
  Users,
  KanbanSquare,
  CalendarClock,
  CheckCircle,
  XCircle,
  UserPlus,
};

function getActivityIcon(type: string) {
  const key = Object.keys(ACTIVITY_TYPE_LABELS).find((k) => type.includes(k.replace(/_/g, ""))) ?? type;
  const iconName = key.startsWith("COMPANY") ? "Building2"
    : key.startsWith("JOB") ? "Briefcase"
    : key.startsWith("CANDIDATE") ? "Users"
    : key.startsWith("INTERVIEW") ? "CalendarClock"
    : key.startsWith("APPLICATION") ? "UserPlus"
    : "KanbanSquare";
  return ICON_MAP[iconName] ?? KanbanSquare;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Atividade recente
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Últimas ações no sistema
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-xl border border-dashed border-border bg-muted px-4 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma atividade registrada.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Atividade recente
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Últimas ações no sistema
            </p>
          </div>
          <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {activities.length} registros
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-0">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const label = ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type;

            return (
              <div
                key={activity.id}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index < activities.length - 1 && (
                  <div className="absolute left-[15px] top-8 h-full w-px bg-muted" />
                )}

                <div className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {activity.user && (
                      <span>{activity.user.name}</span>
                    )}
                    <span>{formatRelativeTime(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
