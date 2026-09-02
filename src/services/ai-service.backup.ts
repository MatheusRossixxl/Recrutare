import type { Job, Candidate } from "@prisma/client";

export interface ResumeExtraction {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  desiredRole?: string;
  desiredRoles?: string;
  professionalSummary?: string;
  birthDate?: string;
  secondaryEmail?: string;
  linkedin?: string;
  portfolio?: string;
  education?: string;
  courses?: string;
  experience?: string;
  skills?: string[];
  languages?: string[];
  salaryExpectation?: number | null;
  hasDriverLicense?: boolean | null;
  driverLicenseCategory?: string;
  gender?: string;
  race?: string;
  sexualOrientation?: string;
  genderIdentity?: string;
  address?: string;
  country?: string;
  summary: string;
}

export interface CandidateJobAnalysis {
  summary: string;
  strengths: string[];
  concerns: string[];
  requirementsFound: string[];
  requirementsMissing: string[];
  relevantExperience: string[];
  suggestedQuestions: string[];
  matchScore: number;
  disclaimer: string;
}

const DISCLAIMER =
  "Esta análise é uma ferramenta de apoio à triagem. A decisão final sobre avançar ou não o candidato é sempre do recrutador.";

function clean(value?: string | null): string | undefined {
  const result = value?.replace(/\s+/g, " ").trim();
  return result || undefined;
}

function extractEmail(text: string): string | undefined {
  return clean(text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0]);
}

function extractPhone(text: string): string | undefined {
  const match = text.match(
    /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4,5}[-.\s]?\d{4}/
  );

  return clean(match?.[0]);
}

function extractLinkedin(text: string): string | undefined {
  const match = text.match(
    /https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i
  );

  return clean(match?.[0]);
}

function extractPortfolio(text: string): string | undefined {
  const match = text.match(
    /https?:\/\/(?!www\.linkedin\.com)[^\s)]+/i
  );

  return clean(match?.[0]);
}

function extractName(text: string): string | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const ignored = [
    "currículo",
    "curriculum",
    "curriculum vitae",
    "experiência profissional",
    "formação",
    "formação acadêmica",
    "educação",
    "habilidades",
    "competências",
    "objetivo",
    "perfil profissional",
    "contato",
  ];

  for (const line of lines.slice(0, 15)) {
    if (
      line.length >= 5 &&
      line.length <= 80 &&
      !line.includes("@") &&
      !/\d{4,}/.test(line) &&
      !ignored.some((item) => line.toLowerCase() === item)
    ) {
      return clean(line);
    }
  }

  return undefined;
}

function extractCity(text: string): string | undefined {
  const patterns = [
    /(?:cidade|localidade|residência|residencia)\s*[:\-]\s*([^\n]+)/i,
    /(?:endereço|endereco).*?,\s*([^,\n]+)\s*[-/]\s*([A-Z]{2})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return clean(match[1]);
    }
  }

  return undefined;
}

function normalizeHeading(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isSectionHeading(line: string): boolean {
  const normalized = normalizeHeading(line);

  const headings = [
    "experiencia profissional",
    "experiencia",
    "formacao academica",
    "formacao",
    "educacao",
    "cursos e certificacoes",
    "cursos",
    "certificacoes",
    "habilidades",
    "competencias",
    "skills",
    "idiomas",
    "languages",
    "objetivo",
    "perfil profissional",
    "resumo profissional",
    "informacoes adicionais",
    "informacoes pessoais",
    "diversidade",
  ];

  return headings.includes(normalized);
}

function extractSection(text: string, headings: string[]): string | undefined {
  const lines = text.split(/\r?\n/);
  let start = -1;

  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const normalizedHeadings = headings.map(normalize);

  for (let i = 0; i < lines.length; i++) {
    const normalized = normalize(lines[i]);

    if (
      normalizedHeadings.some(
        (heading) =>
          normalized === heading ||
          normalized.startsWith(`${heading}:`)
      )
    ) {
      start = i + 1;
      break;
    }
  }

  if (start === -1) return undefined;

  const knownSections = [
    "experiência profissional",
    "experiencia profissional",
    "experiência",
    "experiencia",
    "formação acadêmica",
    "formacao academica",
    "formação",
    "formacao",
    "educação",
    "educacao",
    "cursos e certificações",
    "cursos e certificacoes",
    "cursos",
    "certificações",
    "certificacoes",
    "habilidades",
    "competências",
    "competencias",
    "skills",
    "idiomas",
    "línguas",
    "linguas",
    "languages",
    "objetivo",
    "perfil profissional",
    "resumo profissional",
    "resumo",
    "informações adicionais",
    "informacoes adicionais",
    "informações pessoais",
    "informacoes pessoais",
    "diversidade",
  ].map(normalize);

  const result: string[] = [];

  for (let i = start; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (result.length > 0 && result[result.length - 1] !== "") {
        result.push("");
      }
      continue;
    }

    const normalized = normalize(line);

    if (
      knownSections.some(
        (section) =>
          normalized === section ||
          normalized.startsWith(`${section}:`)
      )
    ) {
      break;
    }

    // Remove marcadores de paginação do PDF:
    // "1 / 6", "2 / 6", etc.
    if (/^\d+\s*\/\s*\d+$/.test(line)) {
      continue;
    }

    // Remove paginações que ficaram grudadas no texto.
    line = line.replace(/\s+\d+\s*\/\s*\d+\s+/g, " ");

    result.push(line);
  }

  if (result.length === 0) return undefined;

  return result
    .join("\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSkills(text: string): string[] {
  const section = extractSection(text, [
    "habilidades",
    "competências",
    "competencias",
    "skills",
  ]);

  if (!section) return [];

  const normalized = section
    .replace(/\d+\s*\/\s*\d+/g, " ")
    .replace(/\r/g, "")
    .trim();

  // Currículos podem vir com habilidades na mesma linha.
  // O padrão "NOME - Nível" permite separar corretamente.
  const matches = normalized.match(
    /([^,\n;•|]+?)\s*-\s*(?:Básico|Basico|Intermediário|Intermediario|Avançado|Avancado)\b/gi
  );

  if (matches && matches.length > 0) {
    return matches
      .map((item) => clean(item))
      .filter((item): item is string => Boolean(item))
      .slice(0, 100);
  }

  return normalized
    .split(/\n|[,;•|]/)
    .map((skill) => clean(skill))
    .filter((skill): skill is string => Boolean(skill))
    .slice(0, 100);
}

function extractLanguages(text: string): string[] {
  const section = extractSection(text, [
    "idiomas",
    "línguas",
    "linguas",
    "languages",
  ]);

  if (!section) return [];

  const lines = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: string[] = [];

  for (const line of lines) {
    // Remove paginação
    const cleanedLine = line.replace(/\d+\s*\/\s*\d+/g, "").trim();

    if (!cleanedLine) continue;

    // Aceita formatos como:
    // INGLÊS - Básico
    // Inglês: Básico
    const matches = cleanedLine.match(
      /([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)\s*(?:-|:)\s*(Básico|Basico|Intermediário|Intermediario|Avançado|Avancado)/gi
    );

    if (matches) {
      for (const match of matches) {
        result.push(match.trim());
      }
      continue;
    }

    // Se a linha for curta, provavelmente é um idioma.
    if (
      cleanedLine.length <= 40 &&
      !/pretensão|salário|cnh|telefone|email|endereço|cidade|país/i.test(cleanedLine)
    ) {
      result.push(cleanedLine);
    }
  }

  return [...new Set(result)].slice(0, 30);
}

function extractBirthDate(text: string): string | undefined {
  const patterns = [
    /(?:data\s+de\s+nascimento|nascimento|nascida\s+em|nascido\s+em)\s*[:\-]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
    /\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match) continue;

    const value = match[1].replace(/[.-]/g, "/");
    const parts = value.split("/");

    if (parts.length !== 3) continue;

    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];

    const date = new Date(`${year}-${month}-${day}T00:00:00`);

    if (
      date.getFullYear() === Number(year) &&
      date.getMonth() + 1 === Number(month) &&
      date.getDate() === Number(day)
    ) {
      return `${year}-${month}-${day}`;
    }
  }

  return undefined;
}

function extractSalary(text: string): number | null {
  const match = text.match(
    /(?:pretensão salarial|pretens[aã]o|sal[aá]rio pretendido|pretendo ganhar)[^\d]{0,30}R?\$?\s*([\d.]+(?:,\d{2})?)/i
  );

  if (!match) return null;

  const value = Number(match[1].replace(/\./g, "").replace(",", "."));

  return Number.isFinite(value) ? value : null;
}

function extractDriverLicense(text: string): {
  hasDriverLicense: boolean | null;
  driverLicenseCategory?: string;
} {
  const lower = text.toLowerCase();

  if (
    /não possuo cnh|nao possuo cnh|não tenho cnh|nao tenho cnh|sem cnh/.test(
      lower
    )
  ) {
    return { hasDriverLicense: false };
  }

  const match = lower.match(
    /\b(?:cnh|habilitação|habilitacao)\b[^\n]{0,50}?(?:categoria|cat\.?)?\s*([a-e](?:,\s*[a-e])*)\b/i
  );

  if (match) {
    return {
      hasDriverLicense: true,
      driverLicenseCategory: match[1].toUpperCase(),
    };
  }

  if (/\bpossuo cnh\b|\btenho cnh\b|\bcnh\b/.test(lower)) {
    return { hasDriverLicense: true };
  }

  return { hasDriverLicense: null };
}

function extractGender(text: string): string | undefined {
  const match = text.match(
    /(?:sexo)\s*[:\-]?\s*(mulher|homem|feminino|masculino|não informado|nao informado)/i
  );

  return clean(match?.[1]);
}

function extractRace(text: string): string | undefined {
  const match = text.match(
    /(?:raça\/cor|raça|raca\/cor|raca)\s*[:\-]?\s*(branca|preta|parda|amarela|indígena|indigena|não informado|nao informado)/i
  );

  return clean(match?.[1]);
}

function extractSexualOrientation(text: string): string | undefined {
  const match = text.match(
    /(?:orientação sexual|orientacao sexual)\s*[:\-]?\s*(heterossexual|homossexual|bissexual|assexual|pansexual|não informado|nao informado)/i
  );

  return clean(match?.[1]);
}

function extractGenderIdentity(text: string): string | undefined {
  const match = text.match(
    /(?:gênero|genero|identidade de gênero|identidade de genero)\s*[:\-]?\s*(cisgênero|cisgenero|transgênero|transgenero|não binário|nao binario|não informado|nao informado)/i
  );

  return clean(match?.[1]);
}


function buildSummary(data: ResumeExtraction): string {
  // O resumo profissional deve representar o resumo do currículo,
  // e não uma concatenação artificial de formação, experiência e habilidades.

  if (data.professionalSummary?.trim()) {
    return data.professionalSummary.trim();
  }

  if (data.summary?.trim()) {
    return data.summary.trim();
  }

  return "";
}

class AIService {
  async analyzeResume(resumeText: string): Promise<ResumeExtraction> {
    const driverLicense = extractDriverLicense(resumeText);

    const education = extractSection(resumeText, [
      "formação acadêmica",
      "formacao academica",
      "educação",
      "educacao",
      "formação",
      "formacao",
    ]);

    const educationFormatted = education
      ? education
          .replace(/\\n{3,}/g, "\\n\\n")
          .trim()
      : undefined;

    const courses = extractSection(resumeText, [
      "cursos",
      "certificações",
      "certificacoes",
      "cursos e certificações",
    ]);

    const coursesFormatted = courses
      ? courses
          .replace(/\\n{3,}/g, "\\n\\n")
          .trim()
      : undefined;

    const experienceRaw = extractSection(resumeText, [
      "experiência profissional",
      "experiencia profissional",
      "experiência",
      "experiencia",
    ]);

    const experience = experienceRaw
      ? experienceRaw
          // Cria uma nova linha antes de cada período.
          .replace(/\s+(Período\s+)/gi, "\n\n$1")
          // Cria uma nova linha antes de cargos que aparecem depois de outro período.
          .replace(
            /\s+(?=(?:GERENTE|ADMINISTRADOR(?:A)?|ASSISTENTE|ANALISTA|COORDENADOR(?:A)?|SUPERVISOR(?:A)?|AUXILIAR|DIRETOR(?:A)?|CONSULTOR(?:A)?|VENDEDOR(?:A)?|ESTAGIÁRIO(?:A)?|ESTAGIARIA)\s)/gi,
            "\n\n"
          )
          .replace(/[ \t]+/g, " ")
          .replace(/\n[ \t]+/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
      : undefined;

    const skills = extractSkills(resumeText);
    const languages = extractLanguages(resumeText);

    const result: ResumeExtraction = {
      name: extractName(resumeText),
      email: extractEmail(resumeText),
      phone: extractPhone(resumeText),
      city: extractCity(resumeText),
      linkedin: extractLinkedin(resumeText),
      portfolio: extractPortfolio(resumeText),
      education: educationFormatted,
      courses: coursesFormatted,
      experience,
      skills,
      languages,
      salaryExpectation: extractSalary(resumeText),
      hasDriverLicense: driverLicense.hasDriverLicense,
      driverLicenseCategory: driverLicense.driverLicenseCategory,
      birthDate: extractBirthDate(resumeText),
      gender: extractGender(resumeText),
      race: extractRace(resumeText),
      sexualOrientation: extractSexualOrientation(resumeText),
      genderIdentity: extractGenderIdentity(resumeText),
      country: "Brasil",
      summary: "",
    };

    result.summary = buildSummary(result);
    result.professionalSummary = result.summary;

    return result;
  }

  async matchCandidateToJob(
    job: Pick<Job, "title" | "description" | "requirements" | "niceToHave">,
    candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">,
    _resumeText?: string
  ): Promise<CandidateJobAnalysis> {
    const candidateSkills = (candidate.skills || "")
      .split(/[,;\n]/)
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean);

    const requirements = job.requirements
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);

    const found: string[] = [];
    const missing: string[] = [];

    for (const requirement of requirements) {
      const normalized = requirement.toLowerCase();

      if (
        candidateSkills.some(
          (skill) =>
            normalized.includes(skill) || skill.includes(normalized)
        )
      ) {
        found.push(requirement);
      } else {
        missing.push(requirement);
      }
    }

    const total = found.length + missing.length || 1;

    return {
      summary: `${candidate.name} possui correspondência com ${Math.round(
        (found.length / total) * 100
      )}% dos requisitos identificados.`,
      strengths: found.slice(0, 5),
      concerns: missing.slice(0, 5),
      requirementsFound: found,
      requirementsMissing: missing,
      relevantExperience: candidate.experience
        ? [candidate.experience.slice(0, 500)]
        : [],
      suggestedQuestions: [
        `Conte sobre sua experiência relacionada à vaga de ${job.title}.`,
        "Descreva um desafio profissional que você enfrentou e como resolveu.",
        "Quais das competências exigidas pela vaga você utiliza com mais frequência?",
      ],
      matchScore: Math.round((found.length / total) * 100),
      disclaimer: DISCLAIMER,
    };
  }

  async generateCandidateSummary(
    candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">
  ): Promise<string> {
    const skills = candidate.skills
      ? candidate.skills
          .split(/[,;\n]/)
          .map((skill) => skill.trim())
          .filter(Boolean)
          .slice(0, 5)
          .join(", ")
      : "";

    return `${candidate.name} possui formação em ${
      candidate.education || "área não informada"
    }${
      skills ? ` e experiência/habilidades em ${skills}` : ""
    }. ${
      candidate.experience
        ? candidate.experience.slice(0, 300)
        : "Experiência profissional não informada."
    }`;
  }

  async generateInterviewQuestions(
    job: Pick<Job, "title" | "requirements">,
    candidate: Pick<Candidate, "experience" | "skills">
  ): Promise<string[]> {
    const skills = candidate.skills
      ? candidate.skills
          .split(/[,;\n]/)
          .map((skill) => skill.trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];

    return [
      `Conte sobre uma experiência relacionada à vaga de ${job.title}.`,
      "Qual foi um dos maiores desafios da sua experiência profissional?",
      "Como você costuma resolver problemas no trabalho?",
      ...skills.map((skill) => `Qual sua experiência prática com ${skill}?`),
    ];
  }
}

export const aiService = new AIService();
