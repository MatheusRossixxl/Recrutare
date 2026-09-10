import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { aiService } from "@/services/ai-service";

export async function POST(req: Request) {
  try {
    const user = await requireApiSession();
    const { applicationId } = await req.json();

    const application = await db.application.findFirst({
      where: { id: applicationId, job: { organizationId: user.organizationId } },
      include: { job: true, candidate: { include: { resumes: { orderBy: { createdAt: "desc" }, take: 1 } } } },
    });

    if (!application) {
      return NextResponse.json({ error: "Candidatura não encontrada" }, { status: 404 });
    }

    const analysis = await aiService.matchCandidateToJob(
      application.job,
      application.candidate
    );

    await db.application.update({
      where: { id: application.id },
      data: { aiMatchScore: analysis.matchScore, aiAnalysisJson: JSON.stringify(analysis) },
    });

    return NextResponse.json(analysis);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    throw err;
  }
}
