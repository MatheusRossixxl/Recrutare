export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  OPEN: "Aberta",
  IN_PROGRESS: "Em processo",
  PAUSED: "Pausada",
  CLOSED: "Encerrada",
};

export const JOB_STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive"> = {
  DRAFT: "default",
  OPEN: "primary",
  IN_PROGRESS: "warning",
  PAUSED: "default",
  CLOSED: "destructive",
};

export const WORK_MODEL_LABELS: Record<string, string> = {
  ON_SITE: "Presencial",
  REMOTE: "Remoto",
  HYBRID: "Híbrido",
};

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  INTERNSHIP: "Estágio",
  TEMPORARY: "Temporário",
  FREELANCE: "Freelance",
};

// ============================================================
// PIPELINE (Kanban)
// ------------------------------------------------------------
// O schema do Prisma usa `stage String` (não um enum do banco),
// porque o SQLite não suporta enums nativos. Por isso o tipo
// `PipelineStage` é definido aqui, em TypeScript puro, a partir
// da lista de etapas abaixo — e não importado de "@prisma/client"
// (esse era o bug que quebrava o build: o client não exporta
// nenhum enum chamado PipelineStage).
// ============================================================

export const PIPELINE_STAGES = [
  "NEW",
  "SCREENING",
  "INTERVIEW",
  "TEST",
  "CLIENT_INTERVIEW",
  "APPROVED",
  "REJECTED",
  "HIRED",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  NEW: "Novo",
  SCREENING: "Triagem",
  INTERVIEW: "Entrevista",
  TEST: "Teste",
  CLIENT_INTERVIEW: "Entrevista com cliente",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  HIRED: "Contratado",
};

// Cor de cada etapa — usada de forma consistente no Kanban, badges e
// gráficos, para que a cor sempre signifique a mesma coisa no sistema.
export const PIPELINE_STAGE_COLOR: Record<string, string> = {
  NEW: "bg-slate-400",
  SCREENING: "bg-sky-400",
  INTERVIEW: "bg-violet-500",
  TEST: "bg-amber-500",
  CLIENT_INTERVIEW: "bg-cyan-500",
  APPROVED: "bg-lime-500",
  REJECTED: "bg-rose-500",
  HIRED: "bg-emerald-500",
};

// Mapeamento das etapas antigas (usadas antes desta migração) para as
// etapas novas. Usado uma única vez na migração de dados existentes —
// mantido aqui para referência e para eventuais scripts futuros.
export const LEGACY_PIPELINE_STAGE_MAP: Record<string, PipelineStage> = {
  NEW: "NEW",
  SCREENING: "SCREENING",
  CONTACT: "SCREENING",
  INTERVIEW: "INTERVIEW",
  EVALUATION: "TEST",
  FINALIST: "CLIENT_INTERVIEW",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
};

export const INTERVIEW_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Agendada",
  DONE: "Realizada",
  CANCELED: "Cancelada",
  RESCHEDULED: "Reagendada",
};

export type InterviewStatus = keyof typeof INTERVIEW_STATUS_LABELS;

export const INTERVIEW_STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive"> = {
  SCHEDULED: "primary",
  DONE: "success",
  CANCELED: "destructive",
  RESCHEDULED: "warning",
};

export const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PHONE: "Telefone",
  VIDEO: "Vídeo",
  IN_PERSON: "Presencial",
  TECHNICAL: "Técnica",
};

export const RECOMMENDATION_LABELS: Record<string, string> = {
  ADVANCE: "Avançar",
  KEEP_IN_ANALYSIS: "Manter em análise",
  REJECT: "Não avançar",
};
