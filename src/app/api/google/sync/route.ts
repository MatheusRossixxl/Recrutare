import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { createCalendarEvent, updateCalendarEvent, isGoogleConnected } from "@/lib/google";

export async function POST() {
  try {
    const user = await requireApiSession();

    const connected = await isGoogleConnected(user.id);
    if (!connected) {
      return NextResponse.json({ error: "Google não conectado" }, { status: 400 });
    }

    // Apenas entrevistas ativas do próprio entrevistador: evita mexer em
    // eventos de outros usuários e em entrevistas finalizadas/canceladas.
    const interviews = await db.interview.findMany({
      where: {
        interviewerId: user.id,
        status: { in: ["SCHEDULED", "RESCHEDULED"] },
      },
      include: { candidate: true, job: true },
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const interview of interviews) {
      const data = {
        id: interview.id,
        scheduledAt: interview.scheduledAt,
        type: interview.type,
        meetingLink: interview.meetingLink,
        notes: interview.notes,
        candidate: { name: interview.candidate.name, email: interview.candidate.email },
        job: { title: interview.job.title },
      };

      try {
        if (interview.googleEventId) {
          // Já sincronizada: atualiza o evento existente (PUT), nunca cria outro.
          const ok = await updateCalendarEvent(user.id, interview.googleEventId, data);
          if (ok) updated++;
          else skipped++;
        } else {
          // Nunca sincronizada: cria e persiste o googleEventId.
          // Segunda execução encontra o ID salvo e cai no branch acima —
          // por isso não duplica.
          const eventId = await createCalendarEvent(user.id, data);
          if (eventId) {
            await db.interview.update({
              where: { id: interview.id },
              data: { googleEventId: eventId },
            });
            created++;
          } else {
            skipped++;
          }
        }
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ created, updated, skipped, total: interviews.length });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    throw err;
  }
}
