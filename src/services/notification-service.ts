import { db } from "@/lib/db";

interface InterviewData {
  id: string;
  scheduledAt: Date;
  candidate: { name: string };
  job: { title: string };
}

/**
 * Notifica quando uma entrevista é criada.
 */
export async function notifyInterviewCreated(
  interview: InterviewData,
  createdBy: { id: string; organizationId: string }
) {
  // Activity
  await db.activity.create({
    data: {
      type: "INTERVIEW_CREATED",
      description: `Entrevista agendada com ${interview.candidate.name} para a vaga "${interview.job.title}"`,
      organizationId: createdBy.organizationId,
      userId: createdBy.id,
    },
  });

  // Notification
  await db.notification.create({
    data: {
      title: "Nova entrevista agendada",
      message: `Entrevista com ${interview.candidate.name} — ${interview.job.title}`,
      organizationId: createdBy.organizationId,
      userId: createdBy.id,
    },
  });
}

/**
 * Notifica quando uma entrevista é atualizada.
 */
export async function notifyInterviewUpdated(
  interview: InterviewData,
  updatedBy: { id: string; organizationId: string }
) {
  await db.activity.create({
    data: {
      type: "INTERVIEW_UPDATED",
      description: `Entrevista com ${interview.candidate.name} foi alterada`,
      organizationId: updatedBy.organizationId,
      userId: updatedBy.id,
    },
  });

  await db.notification.create({
    data: {
      title: "Entrevista alterada",
      message: `Entrevista com ${interview.candidate.name} — ${interview.job.title} foi atualizada`,
      organizationId: updatedBy.organizationId,
      userId: updatedBy.id,
    },
  });
}

/**
 * Notifica quando uma entrevista é cancelada.
 */
export async function notifyInterviewCanceled(
  interview: InterviewData,
  canceledBy: { id: string; organizationId: string }
) {
  await db.activity.create({
    data: {
      type: "INTERVIEW_CANCELED",
      description: `Entrevista com ${interview.candidate.name} foi cancelada`,
      organizationId: canceledBy.organizationId,
      userId: canceledBy.id,
    },
  });

  await db.notification.create({
    data: {
      title: "Entrevista cancelada",
      message: `Entrevista com ${interview.candidate.name} — ${interview.job.title} foi cancelada`,
      organizationId: canceledBy.organizationId,
      userId: canceledBy.id,
    },
  });
}

/**
 * Verifica entrevistas próximas e envia lembretes.
 * Chamado pelo cron job.
 *
 * Cada entrevista respeita seu próprio `reminderMinutes` (minutos antes
 * do horário agendado). Janela de busca: maior opção suportada pela UI
 * (60 min) + margem de 5 min para atraso do cron. Entrevistas já
 * notificadas (`reminderSent`) ou sem `reminderMinutes` são ignoradas.
 */
const MAX_REMINDER_WINDOW_MINUTES = 65;

export async function checkAndSendReminders(): Promise<number> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + MAX_REMINDER_WINDOW_MINUTES * 60 * 1000);

  const upcomingInterviews = await db.interview.findMany({
    where: {
      status: { in: ["SCHEDULED", "RESCHEDULED"] },
      reminderSent: false,
      reminderMinutes: { not: null },
      scheduledAt: {
        gt: now,
        lte: windowEnd,
      },
    },
    include: { candidate: true, job: true },
  });

  let notificationsCreated = 0;

  for (const interview of upcomingInterviews) {
    const reminderMinutes = interview.reminderMinutes;
    if (!reminderMinutes || reminderMinutes <= 0) continue;

    // Momento em que o lembrete vence: scheduledAt - reminderMinutes.
    // Envia se esse momento já passou (cron pode atrasar) e a
    // entrevista ainda é futura.
    const remindAt = new Date(interview.scheduledAt).getTime() - reminderMinutes * 60 * 1000;
    const timeUntilInterview = new Date(interview.scheduledAt).getTime() - now.getTime();

    if (remindAt <= now.getTime() && timeUntilInterview > 0) {
      const label =
        reminderMinutes >= 60
          ? `${Math.round((reminderMinutes / 60) * 10) / 10}h`.replace(".5h", ",5h")
          : `${reminderMinutes} min`;

      await db.notification.create({
        data: {
          title: "Lembrete de entrevista",
          message: `Entrevista em ${label} — ${interview.candidate.name} — ${interview.job.title}`,
          organizationId: interview.organizationId,
          userId: interview.interviewerId,
        },
      });

      await db.interview.update({
        where: { id: interview.id },
        data: { reminderSent: true },
      });

      notificationsCreated++;
    }
  }

  return notificationsCreated;
}
