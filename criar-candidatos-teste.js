
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  const organization = await db.organization.findFirst();

  if (!organization) {
    throw new Error("Nenhuma organização encontrada no banco.");
  }

  const candidates = [
    ["Candidato 01","candidato01@teste.com","3 anos de experiência profissional na área administrativa e financeira.","Administração — Faculdade Teste","Gestão de projetos","Excel, SQL, Power BI","Português","Profissional com experiência em análise de dados."],
    ["Candidato 02","candidato02@teste.com","3 anos de experiência profissional em análise de dados.","Ciência da Computação — Faculdade Teste","Excel, SQL, Power BI","Python, Power BI","Português","Profissional com formação em tecnologia e experiência em dados."],
    ["Candidato 03","candidato03@teste.com","3 anos de experiência utilizando Excel e SQL em rotinas profissionais.","Sistemas de Informação — Faculdade Teste","Gestão de projetos","Python, Power BI","Português","Profissional que utiliza Excel e SQL no trabalho."],
    ["Candidato 04","candidato04@teste.com","4 anos de experiência. Trabalhou em startup de tecnologia em crescimento, participando de projetos de produto e operações.","Administração — Faculdade Teste","Gestão de startups, Excel","Excel, Gestão de Projetos","Português","Profissional com experiência comprovada em ambiente de startup."],
    ["Candidato 05","candidato05@teste.com","4 anos de experiência na empresa StartUp Solutions, atuando em projetos administrativos.","Administração — Faculdade Teste","Excel","Excel, Administração","Português","Profissional com experiência administrativa."],
    ["Candidato 06","candidato06@teste.com","5 anos de experiência profissional em desenvolvimento de sistemas, atuando em projetos de médio e grande porte.","Ciência da Computação — Faculdade Teste","SQL, AWS","JavaScript, TypeScript, SQL, AWS","Português","Desenvolvedor com cinco anos de experiência."],
    ["Candidato 07","candidato07@teste.com","1 ano de experiência profissional em desenvolvimento de sistemas.","Sistemas de Informação — Faculdade Teste","SQL","JavaScript, TypeScript","Português","Desenvolvedor em início de carreira."],
    ["Candidato 08","candidato08@teste.com","3 anos de experiência profissional em atendimento e operações.","Administração — Faculdade Teste","Excel","Excel, Atendimento","Inglês básico","Profissional com experiência em operações e atendimento."],
    ["Candidato 09","candidato09@teste.com","3 anos de experiência profissional em tecnologia e análise de dados.","Sistemas de Informação — Faculdade Teste","SQL, Power BI","Excel, SQL, Power BI","Inglês intermediário","Profissional de tecnologia com inglês intermediário."],
    ["Candidato 10","candidato10@teste.com","4 anos de experiência profissional em tecnologia, participando de projetos internacionais.","Ciência da Computação — Faculdade Teste","AWS, SQL, Excel","Excel, SQL, TypeScript, AWS","Inglês avançado","Profissional de tecnologia com experiência em projetos internacionais."],
    ["Candidato 11","candidato11@teste.com","6 anos de experiência em desenvolvimento de software, incluindo 4 anos em startup de tecnologia. Atua com projetos internacionais.","Ciência da Computação — Faculdade Teste","SQL, AWS, Gestão de Produtos","Node.js, TypeScript, SQL, AWS, Docker, Excel","Inglês fluente","Profissional sênior com experiência em startups, tecnologia e projetos internacionais."],
    ["Candidato 12","candidato12@teste.com","2 anos de experiência profissional em desenvolvimento e análise de sistemas.","Sistemas de Informação — Faculdade Teste","SQL, Excel","TypeScript, SQL, Excel","Inglês intermediário","Profissional com experiência intermediária em tecnologia."],
    ["Candidato 13","candidato13@teste.com","1 ano de experiência profissional em suporte administrativo.","Administração — Faculdade Teste","Atendimento","Atendimento, Organização","Português","Profissional em início de carreira."]
  ];

  let created = 0;
  let skipped = 0;

  for (const [name,email,experience,education,courses,skills,languages,summary] of candidates) {
    const existing = await db.candidate.findFirst({
      where: {
        organizationId: organization.id,
        email
      }
    });

    if (existing) {
      console.log(`Já existe: ${name}`);
      skipped++;
      continue;
    }

    await db.candidate.create({
      data: {
        organizationId: organization.id,
        name,
        email,
        experience,
        education,
        courses,
        skills,
        languages,
        professionalSummary: summary,
        country: "Brasil"
      }
    });

    console.log(`Criado: ${name}`);
    created++;
  }

  console.log("");
  console.log(`================================`);
  console.log(`${created} candidatos criados`);
  console.log(`${skipped} já existiam`);
  console.log(`================================`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
