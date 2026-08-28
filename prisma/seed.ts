import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const FIRST_NAMES = [
  "Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Hugo",
  "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Olívia",
  "Pedro", "Queila", "Rafael", "Sofia", "Thiago", "Ursula", "Vitor",
  "Wesley", "Ximena", "Yasmin", "Zeca", "Beatriz", "Caio", "Daniela", "Enzo",
];
const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Almeida",
  "Ferreira", "Rodrigues", "Carvalho", "Gomes", "Martins", "Araújo", "Barbosa",
  "Ribeiro",
];
const CITIES = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS", "Salvador, BA", "Recife, PE"];
const SKILL_POOL = [
  "React", "Node.js", "TypeScript", "Python", "SQL", "AWS", "Docker",
  "Kubernetes", "Product Management", "Figma", "SEO", "Copywriting",
  "Excel avançado", "Vendas B2B", "Negociação", "Java", "Go", "Kotlin",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickMany<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function main() {
  console.log("Limpando banco...");
  await db.notification.deleteMany();
  await db.activity.deleteMany();
  await db.evaluation.deleteMany();
  await db.interview.deleteMany();
  await db.stageHistory.deleteMany();
  await db.application.deleteMany();
  await db.resume.deleteMany();
  await db.candidate.deleteMany();
  await db.job.deleteMany();
  await db.company.deleteMany();
  await db.user.deleteMany();
  await db.organization.deleteMany();

  console.log("Criando organização e usuários...");
  const passwordHash = await bcrypt.hash("senha123", 10);

  const org = await db.organization.create({
    data: { name: "Recrutare Talent Partners", slug: "recrutare-demo" },
  });

  const admin = await db.user.create({
    data: {
      organizationId: org.id,
      name: "Ana Ribeiro",
      email: "ana@recrutare.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const recruiter = await db.user.create({
    data: {
      organizationId: org.id,
      name: "Bruno Andrade",
      email: "bruno@recrutare.com",
      passwordHash,
      role: "RECRUITER",
    },
  });

  console.log("Criando empresas clientes...");
  const companiesData = [
    { name: "NovaTech Sistemas", segment: "Tecnologia", cnpj: "12.345.678/0001-90", contactName: "Marina Duarte", email: "rh@novatech.com", phone: "(11) 4000-1000" },
    { name: "Grupo Vetta Varejo", segment: "Varejo", cnpj: "98.765.432/0001-10", contactName: "Rodrigo Lima", email: "contratacoes@vetta.com", phone: "(21) 4000-2000" },
    { name: "Financeira Aliar", segment: "Serviços Financeiros", cnpj: "11.222.333/0001-44", contactName: "Camila Prado", email: "talentos@aliar.com", phone: "(31) 4000-3000" },
  ];
  const companies = [];
  for (const c of companiesData) {
    companies.push(await db.company.create({ data: { ...c, organizationId: org.id } }));
  }

  console.log("Criando vagas...");
  const jobsData = [
    { title: "Desenvolvedor(a) Backend Pleno", company: 0, contractType: "CLT", workModel: "REMOTE", status: "OPEN", salaryMin: 8000, salaryMax: 12000, requirements: "Node.js, TypeScript, SQL, AWS" },
    { title: "Desenvolvedor(a) Frontend Sênior", company: 0, contractType: "CLT", workModel: "HYBRID", status: "IN_PROGRESS", salaryMin: 12000, salaryMax: 16000, requirements: "React, TypeScript, Figma" },
    { title: "Product Manager", company: 0, contractType: "PJ", workModel: "REMOTE", status: "OPEN", salaryMin: 10000, salaryMax: 15000, requirements: "Product Management, SQL, Negociação" },
    { title: "Analista de Vendas B2B", company: 1, contractType: "CLT", workModel: "ON_SITE", status: "OPEN", salaryMin: 4000, salaryMax: 6000, requirements: "Vendas B2B, Negociação, Excel avançado" },
    { title: "Coordenador(a) de E-commerce", company: 1, contractType: "CLT", workModel: "HYBRID", status: "PAUSED", salaryMin: 7000, salaryMax: 9000, requirements: "SEO, Excel avançado, Copywriting" },
    { title: "Analista Financeiro Sênior", company: 2, contractType: "CLT", workModel: "ON_SITE", status: "OPEN", salaryMin: 9000, salaryMax: 13000, requirements: "Excel avançado, SQL" },
    { title: "Engenheiro(a) de Dados", company: 2, contractType: "CLT", workModel: "REMOTE", status: "IN_PROGRESS", salaryMin: 13000, salaryMax: 18000, requirements: "Python, SQL, AWS, Docker" },
    { title: "Estagiário(a) de RH", company: 0, contractType: "INTERNSHIP", workModel: "ON_SITE", status: "CLOSED", salaryMin: 1800, salaryMax: 1800, requirements: "Excel avançado, Comunicação" },
  ];
  const jobs = [];
  for (const j of jobsData) {
    jobs.push(
      await db.job.create({
        data: {
          organizationId: org.id,
          companyId: companies[j.company].id,
          title: j.title,
          description: `Vaga de ${j.title} para atuação em projetos estratégicos da empresa.`,
          requirements: j.requirements,
          niceToHave: "Inglês intermediário, experiência em startups",
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          contractType: j.contractType,
          workModel: j.workModel,
          location: pick(CITIES),
          openings: 1,
          status: j.status,
          openedAt: j.status !== "DRAFT" ? new Date() : null,
        },
      })
    );
  }

  console.log("Criando candidatos e candidaturas...");
  const stages: string[] = [
"NEW", "NEW", "NEW",
"SCREENING", "SCREENING",
"INTERVIEW", "INTERVIEW",
"TEST",
"CLIENT_INTERVIEW",
"APPROVED",
"HIRED",
"REJECTED", "REJECTED",
  ];

  const candidates = [];
  for (let i = 0; i < 30; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}${i}@example.com`;
    const skills = pickMany(SKILL_POOL, 3 + Math.floor(Math.random() * 3));

    const candidate = await db.candidate.create({
      data: {
        organizationId: org.id,
        name,
        email,
        phone: `(11) 9${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`,
        city: pick(CITIES),
        linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, "-")}`,
        education: pick(["Ciência da Computação — USP", "Administração — FGV", "Engenharia de Produção — UFMG", "Sistemas de Informação — PUC", "Marketing — ESPM"]),
        experience: `${2 + Math.floor(Math.random() * 8)} anos de experiência em ${skills.slice(0, 2).join(" e ")}, atuando em projetos de médio e grande porte.`,
        skills: skills.join(", "),
        languages: pick(["Português (nativo)", "Português (nativo), Inglês (avançado)", "Português (nativo), Inglês (intermediário), Espanhol (básico)"]),
      },
    });
    candidates.push(candidate);

    // Associa a 1 ou 2 vagas aleatórias
    const jobCount = 1 + Math.floor(Math.random() * 2);
    const jobSample = pickMany(jobs, jobCount);
    for (const job of jobSample) {
      const stage = pick(stages);
      const application = await db.application.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          stage,
          isFinalist: stage === "APPROVED" || stage === "HIRED",
        },
      });
      await db.stageHistory.create({
        data: { applicationId: application.id, toStage: "NEW", changedByName: "Sistema (seed)" },
      });
      if (stage !== "NEW") {
        await db.stageHistory.create({
          data: { applicationId: application.id, fromStage: "NEW", toStage: stage, changedByName: recruiter.name },
        });
      }
      await db.activity.create({
        data: {
          organizationId: org.id,
          userId: recruiter.id,
          candidateId: candidate.id,
          type: "APPLICATION_CREATED",
          description: `${candidate.name} foi adicionado à vaga ${job.title}.`,
        },
      });

      // Algumas entrevistas e avaliações para candidatos em estágios avançados
if (["INTERVIEW", "TEST", "CLIENT_INTERVIEW", "APPROVED", "HIRED"].includes(stage) && Math.random() > 0.3) {        const scheduledAt = new Date(Date.now() + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10) * 86400000);
        const interview = await db.interview.create({
          data: {
            organizationId: org.id,
            jobId: job.id,
            candidateId: candidate.id,
            interviewerId: pick([admin.id, recruiter.id]),
            scheduledAt,
            type: pick(["VIDEO", "PHONE", "TECHNICAL", "IN_PERSON"]),
            status: scheduledAt < new Date() ? "DONE" : "SCHEDULED",
            meetingLink: "https://meet.google.com/demo-link",
          },
        });

        if (interview.status === "DONE" && Math.random() > 0.4) {
          await db.evaluation.create({
            data: {
              interviewId: interview.id,
              candidateId: candidate.id,
              evaluatorId: interview.interviewerId,
              communication: 3 + Math.floor(Math.random() * 3),
              technicalSkill: 3 + Math.floor(Math.random() * 3),
              knowledge: 3 + Math.floor(Math.random() * 3),
              jobFit: 3 + Math.floor(Math.random() * 3),
              positives: "Boa comunicação e domínio técnico demonstrado na entrevista.",
              negatives: "Pouca experiência com liderança de equipes.",
              recommendation: pick(["ADVANCE", "KEEP_IN_ANALYSIS", "REJECT"]),
            },
          });
        }
      }
    }
  }

  console.log("Seed concluído!");
  console.log(`Organização: ${org.name}`);
  console.log(`Login: ana@recrutare.com / senha123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
