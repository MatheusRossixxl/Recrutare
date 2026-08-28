/**
 * AIService — camada de abstração para funcionalidades de IA.
 *
 * Objetivo: o resto da aplicação nunca fala diretamente com o provedor
 * de IA. Ele chama estas funções, e é aqui que decidimos se usamos a
 * API real (Claude, via ANTHROPIC_API_KEY) ou o mock determinístico
 * abaixo, usado enquanto a integração não está configurada.
 *
 * IMPORTANTE: a IA nunca decide sozinha uma contratação. Toda saída
 * inclui o texto de apoio "decisão final é do recrutador" e os campos
 * são sempre apresentados como sugestão, nunca como veredito.
 */

import type { Job, Candidate } from "@prisma/client";

export interface ResumeExtraction {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  languages?: string[];
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
  matchScore: number; // 0-100, indicador de apoio — nunca decisório
  disclaimer: string;
}

const DISCLAIMER =
  "Esta análise é uma ferramenta de apoio à triagem. A decisão final sobre avançar ou não o candidato é sempre do recrutador.";

const isAIConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

class AIService {
  /** Extrai informações estruturadas do texto de um currículo. */
  async analyzeResume(resumeText: string): Promise<ResumeExtraction> {
    if (!isAIConfigured()) {
      return mockAnalyzeResume(resumeText);
    }
    return callAnthropicForResume(resumeText);
  }

  /** Compara um candidato com os requisitos de uma vaga. */
  async matchCandidateToJob(
    job: Pick<Job, "title" | "description" | "requirements" | "niceToHave">,
    candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">,
    resumeText?: string
  ): Promise<CandidateJobAnalysis> {
    if (!isAIConfigured()) {
      return mockMatchCandidateToJob(job, candidate);
    }
    return callAnthropicForMatch(job, candidate, resumeText);
  }

  /** Gera um resumo profissional curto do candidato. */
  async generateCandidateSummary(candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">): Promise<string> {
    if (!isAIConfigured()) {
      return mockGenerateCandidateSummary(candidate);
    }
    return callAnthropicForSummary(candidate);
  }

  /** Sugere perguntas de entrevista com base na vaga e no candidato. */
  async generateInterviewQuestions(
    job: Pick<Job, "title" | "requirements">,
    candidate: Pick<Candidate, "experience" | "skills">
  ): Promise<string[]> {
    if (!isAIConfigured()) {
      return mockGenerateInterviewQuestions(job, candidate);
    }
    return callAnthropicForQuestions(job, candidate);
  }
}

export const aiService = new AIService();

// ============================================================
// MOCK — determinístico, sem chamadas externas.
// Usado automaticamente quando ANTHROPIC_API_KEY não está configurada.
// ============================================================

function splitSkills(skills?: string | null): string[] {
  if (!skills) return [];
  return skills
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mockAnalyzeResume(resumeText: string): ResumeExtraction {
  const emailMatch = resumeText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = resumeText.match(/(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/);
  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    summary:
      "Resumo gerado automaticamente (modo simulado — configure ANTHROPIC_API_KEY para análise real). " +
      "Revise e ajuste os campos abaixo antes de salvar o candidato.",
    skills: [],
    languages: [],
  };
}

function mockMatchCandidateToJob(
  job: Pick<Job, "title" | "description" | "requirements" | "niceToHave">,
  candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">
): CandidateJobAnalysis {
  const candidateSkills = splitSkills(candidate.skills).map((s) => s.toLowerCase());
  const requirementWords = job.requirements
    .split(/[,;\n]/)
    .map((r) => r.trim())
    .filter(Boolean);

  const found: string[] = [];
  const missing: string[] = [];

  for (const req of requirementWords) {
    const matches = candidateSkills.some((skill) => req.toLowerCase().includes(skill) || skill.includes(req.toLowerCase()));
    if (matches) found.push(req);
    else missing.push(req);
  }

  const total = found.length + missing.length || 1;
  const score = Math.round((found.length / total) * 100);

  return {
    summary: `${candidate.name} é um candidato para a vaga de ${job.title} com experiência declarada em: ${
      candidate.experience?.slice(0, 140) || "não informado"
    }. (Análise simulada — configure a IA real para um resumo mais preciso.)`,
    strengths: found.length > 0 ? found.slice(0, 5).map((f) => `Possui experiência relacionada a: ${f}`) : ["Perfil ainda não comparado a fundo — revisar manualmente."],
    concerns: missing.length > 0 ? [`Não foram encontradas evidências claras de: ${missing.slice(0, 3).join(", ")}`] : [],
    requirementsFound: found,
    requirementsMissing: missing,
    relevantExperience: candidate.experience ? [candidate.experience.slice(0, 200)] : [],
    suggestedQuestions: mockGenerateInterviewQuestions(
      { title: job.title, requirements: job.requirements },
      { experience: candidate.experience, skills: candidate.skills }
    ),
    matchScore: score,
    disclaimer: DISCLAIMER,
  };
}

function mockGenerateCandidateSummary(candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">): string {
  const skills = splitSkills(candidate.skills).slice(0, 5).join(", ");
  return `${candidate.name} é um profissional com formação em ${candidate.education || "não informada"}${
    skills ? ` e habilidades em ${skills}` : ""
  }. Experiência: ${candidate.experience?.slice(0, 160) || "não informada"}.`;
}

function mockGenerateInterviewQuestions(
  job: Pick<Job, "title" | "requirements">,
  candidate: Pick<Candidate, "experience" | "skills">
): string[] {
  const skills = splitSkills(candidate.skills);
  const base = [
    `Conte sobre uma experiência prática relacionada a ${job.title}.`,
    "Descreva um desafio recente no trabalho e como você o resolveu.",
    "O que te motivou a se candidatar para esta vaga?",
  ];
  const skillQuestions = skills.slice(0, 2).map((s) => `Qual sua experiência prática com ${s}?`);
  return [...base, ...skillQuestions];
}

// ============================================================
// INTEGRAÇÃO REAL — implementar quando ANTHROPIC_API_KEY estiver setada.
// Deixado como stub claramente separado, conforme regra do briefing
// de nunca simular uma integração externa sem deixá-la explícita.
// ============================================================

async function callAnthropicForResume(_resumeText: string): Promise<ResumeExtraction> {
  throw new Error(
    "Integração real com IA ainda não implementada nesta etapa do MVP. " +
      "Defina a lógica de chamada à API da Anthropic aqui, ou remova ANTHROPIC_API_KEY do .env para usar o modo simulado."
  );
}

async function callAnthropicForMatch(
  _job: Pick<Job, "title" | "description" | "requirements" | "niceToHave">,
  _candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">,
  _resumeText?: string
): Promise<CandidateJobAnalysis> {
  throw new Error("Integração real com IA ainda não implementada nesta etapa do MVP.");
}

async function callAnthropicForSummary(
  _candidate: Pick<Candidate, "name" | "experience" | "education" | "skills">
): Promise<string> {
  throw new Error("Integração real com IA ainda não implementada nesta etapa do MVP.");
}

async function callAnthropicForQuestions(
  _job: Pick<Job, "title" | "requirements">,
  _candidate: Pick<Candidate, "experience" | "skills">
): Promise<string[]> {
  throw new Error("Integração real com IA ainda não implementada nesta etapa do MVP.");
}
