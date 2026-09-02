
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  const organization = await db.organization.findFirst();

  if (!organization) {
    throw new Error("Nenhuma organização encontrada no banco.");
  }

  const company = await db.company.findFirst({
    where: {
      organizationId: organization.id
    }
  });

  if (!company) {
    throw new Error("Nenhuma empresa encontrada nesta organização.");
  }

  console.log("Empresa usada:", company.name);

  const existing = await db.job.findFirst({
    where: {
      organizationId: organization.id,
      title: "Analista de Dados — TESTE DE COMPATIBILIDADE"
    }
  });

  if (existing) {
    console.log("A vaga de teste já existe.");
    console.log("ID:", existing.id);
    return;
  }

  const job = await db.job.create({
    data: {
      organization: {
        connect: {
          id: organization.id
        }
      },
      company: {
        connect: {
          id: company.id
        }
      },
      title: "Analista de Dados — TESTE DE COMPATIBILIDADE",
      description:
        "Buscamos profissional para atuar com análise de dados, indicadores e suporte à tomada de decisão. A pessoa contratada trabalhará em ambiente de tecnologia e deverá ter boa capacidade analítica e experiência prática com ferramentas de dados.",
      requirements:
        "Excel, SQL, mínimo de 3 anos de experiência, Inglês intermediário, experiência em startups",
      niceToHave:
        "Power BI, Python, AWS",
      salaryMin: 5000,
      salaryMax: 8000
    }
  });

  console.log("");
  console.log("==========================================");
  console.log("VAGA CRIADA COM SUCESSO");
  console.log("==========================================");
  console.log("Título:", job.title);
  console.log("ID:", job.id);
  console.log("");
  console.log("REQUISITOS:");
  console.log("Excel");
  console.log("SQL");
  console.log("Mínimo de 3 anos de experiência");
  console.log("Inglês intermediário");
  console.log("Experiência em startups");
  console.log("");
  console.log("DIFERENCIAIS:");
  console.log("Power BI");
  console.log("Python");
  console.log("AWS");
  console.log("");
  console.log("SALÁRIO: R$ 5.000 a R$ 8.000");
  console.log("==========================================");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
