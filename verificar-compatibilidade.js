
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  const jobId = "cmtj77yhq0000ndispqxoeea4";

  const applications = await db.application.findMany({
    where: { jobId },
    include: {
      candidate: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      candidate: {
        name: "asc"
      }
    }
  });

  console.log("================================");
  console.log("RESULTADO DA COMPATIBILIDADE");
  console.log("================================");

  for (const app of applications) {
    console.log(
      `${app.candidate.name}: ${app.aiMatchScore === null ? "SEM ANÁLISE" : app.aiMatchScore + "%"}`
    );
  }

  console.log("================================");
  console.log(`Total: ${applications.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
