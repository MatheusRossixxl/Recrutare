
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  const jobId = "cmtj77yhq0000ndispqxoeea4";

  const applications = await db.application.findMany({
    where: { jobId },
    include: {
      candidate: true,
      job: true
    },
    orderBy: {
      candidate: {
        name: "asc"
      }
    }
  });

  console.log(`Encontradas: ${applications.length} candidaturas`);

  for (const app of applications) {
    try {
      const response = await fetch("http://localhost:3000/api/ai/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          applicationId: app.id
        })
      });

      const text = await response.text();

      if (!response.ok) {
        console.log(`ERRO: ${app.candidate.name} → HTTP ${response.status}`);
        console.log(text);
        continue;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.log(`ERRO: ${app.candidate.name} → resposta não-JSON`);
        console.log(text);
        continue;
      }

      console.log(
        `Analisado: ${app.candidate.name} → ${data.analysis?.matchScore ?? data.matchScore ?? "?"}%`
      );
    } catch (error) {
      console.log(`ERRO: ${app.candidate.name}`, error.message);
    }
  }

  console.log("================================");
  console.log("ANÁLISE CONCLUÍDA");
  console.log("================================");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
