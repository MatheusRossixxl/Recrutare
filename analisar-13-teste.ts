import { PrismaClient } from "@prisma/client";
import { aiService } from "./src/services/ai-service";

const db = new PrismaClient();

const JOB_ID = "cmtj77yhq0000ndispqxoeea4";

async function main() {
  const applications = await db.application.findMany({
    where: {
      jobId: JOB_ID,
    },
    include: {
      job: true,
      candidate: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`Encontradas: ${applications.length} candidaturas\n`);

  for (const app of applications) {
    try {
      const analysis = await aiService.matchCandidateToJob(
        app.job,
        app.candidate
      );

      await db.application.update({
        where: { id: app.id },
        data: {
          aiMatchScore: analysis.matchScore,
          aiAnalysisJson: JSON.stringify(analysis),
        },
      });

      console.log(
        `OK: ${app.candidate.name} → ${analysis.matchScore}%`
      );
    } catch (error) {
      console.error(`ERRO: ${app.candidate.name}`);
      console.error(error);
    }
  }

  console.log("\n================================");
  console.log("ANÁLISE CONCLUÍDA");
  console.log("================================");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
