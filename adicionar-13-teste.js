
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  const jobId = "cmtj77yhq0000ndispqxoeea4";

  const candidates = await db.candidate.findMany({
    where: {
      email: {
        startsWith: "candidato"
      }
    },
    orderBy: {
      email: "asc"
    }
  });

  console.log(`Encontrados: ${candidates.length} candidatos`);

  for (const candidate of candidates) {
    const existing = await db.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: candidate.id
        }
      }
    });

    if (existing) {
      console.log(`Já estava: ${candidate.name}`);
      continue;
    }

    await db.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        stage: "NEW"
      }
    });

    console.log(`Adicionado: ${candidate.name}`);
  }

  console.log("================================");
  console.log("TESTE PREPARADO");
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
