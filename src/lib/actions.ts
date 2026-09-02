"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { aiService } from "@/services/ai-service";
import type { PipelineStage } from "@/lib/constants";

// ============================================================
// EMPRESAS CLIENTES
// ============================================================

export async function createCompany(formData: FormData) {
  const user = await requireSession();

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Nome da empresa é obrigatório");

  const company = await db.company.create({
    data: {
      organizationId: user.organizationId,
      name,
      cnpj: String(formData.get("cnpj") || "") || null,
      segment: String(formData.get("segment") || "") || null,
      contactName: String(formData.get("contactName") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });

  await logActivity(user.organizationId, user.id, "COMPANY_CREATED", `Empresa "${company.name}" foi cadastrada.`);

  revalidatePath("/companies");
  redirect(`/companies/${company.id}`);
}

export async function updateCompany(companyId: string, formData: FormData) {
  const user = await requireSession();

  const existing = await db.company.findFirst({ where: { id: companyId, organizationId: user.organizationId } });
  if (!existing) throw new Error("Empresa não encontrada");

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Nome da empresa é obrigatório");

  const company = await db.company.update({
    where: { id: companyId },
    data: {
      name,
      cnpj: String(formData.get("cnpj") || "") || null,
      segment: String(formData.get("segment") || "") || null,
      contactName: String(formData.get("contactName") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });

  await logActivity(user.organizationId, user.id, "COMPANY_UPDATED", `Empresa "${company.name}" foi atualizada.`);

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function deleteCompany(companyId: string) {
  const user = await requireSession();

  const company = await db.company.findFirst({
    where: {
      id: companyId,
      organizationId: user.organizationId,
    },
    include: {
      jobs: {
        include: {
          applications: true,
          interviews: true,
        },
      },
    },
  });

  if (!company) {
    throw new Error("Empresa não encontrada");
  }

  if (company.jobs.length > 0) {
    throw new Error(
      "Não é possível excluir uma empresa que possui vagas cadastradas. Arquive a empresa ou exclua as vagas primeiro."
    );
  }

  await db.company.delete({
    where: {
      id: companyId,
    },
  });

  revalidatePath("/companies");
  revalidatePath("/dashboard");
}

export async function archiveCompany(companyId: string) {
  const user = await requireSession();

  const company = await db.company.findFirst({
    where: { id: companyId, organizationId: user.organizationId },
    include: { jobs: { where: { status: { in: ["OPEN", "IN_PROGRESS"] }, archived: false } } },
  });
  if (!company) throw new Error("Empresa não encontrada");

  await db.company.update({
    where: { id: companyId },
    data: { archived: true, archivedAt: new Date() },
  });

  await logActivity(
    user.organizationId,
    user.id,
    "COMPANY_ARCHIVED",
    `Empresa "${company.name}" foi arquivada${company.jobs.length > 0 ? ` (com ${company.jobs.length} vaga(s) ainda ativa(s))` : ""}.`
  );

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
}

export async function restoreCompany(companyId: string) {
  const user = await requireSession();

  const company = await db.company.findFirst({ where: { id: companyId, organizationId: user.organizationId } });
  if (!company) throw new Error("Empresa não encontrada");

  await db.company.update({ where: { id: companyId }, data: { archived: false, archivedAt: null } });

  await logActivity(user.organizationId, user.id, "COMPANY_RESTORED", `Empresa "${company.name}" foi restaurada.`);

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
}

// ============================================================
// VAGAS
// ============================================================

export async function createJob(formData: FormData) {
  const user = await requireSession();

  const title = String(formData.get("title") || "").trim();
  const companyId = String(formData.get("companyId") || "");
  if (!title || !companyId) throw new Error("Título e empresa são obrigatórios");

  // Garante que a empresa pertence à mesma organização (isolamento multi-tenant)
  const company = await db.company.findFirst({ where: { id: companyId, organizationId: user.organizationId } });
  if (!company) throw new Error("Empresa inválida");

  const salaryMinRaw = String(formData.get("salaryMin") || "");
  const salaryMaxRaw = String(formData.get("salaryMax") || "");
  const deadlineRaw = String(formData.get("deadline") || "");

  const job = await db.job.create({
    data: {
      organizationId: user.organizationId,
      companyId,
      title,
      description: String(formData.get("description") || ""),
      requirements: String(formData.get("requirements") || ""),
      niceToHave: String(formData.get("niceToHave") || "") || null,
      salaryMin: salaryMinRaw ? Number(salaryMinRaw) : null,
      salaryMax: salaryMaxRaw ? Number(salaryMaxRaw) : null,
      contractType: (String(formData.get("contractType") || "CLT") as any),
      workModel: (String(formData.get("workModel") || "ON_SITE") as any),
      location: String(formData.get("location") || "") || null,
      openings: Number(formData.get("openings") || 1),
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      status: (String(formData.get("status") || "DRAFT") as any),
      openedAt: String(formData.get("status")) === "OPEN" ? new Date() : null,
      responsibleId: String(formData.get("responsibleId") || "") || null,
      priority: String(formData.get("priority") || "NORMAL"),
    },
  });

  await logActivity(user.organizationId, user.id, "JOB_CREATED", `Vaga "${job.title}" foi criada.`);

  revalidatePath("/jobs");
  redirect(`/jobs/${job.id}`);
}

export async function updateJob(jobId: string, formData: FormData) {
  const user = await requireSession();

  const existing = await db.job.findFirst({ where: { id: jobId, organizationId: user.organizationId } });
  if (!existing) throw new Error("Vaga não encontrada");

  const title = String(formData.get("title") || "").trim();
  const companyId = String(formData.get("companyId") || "");
  if (!title || !companyId) throw new Error("Título e empresa são obrigatórios");

  const company = await db.company.findFirst({ where: { id: companyId, organizationId: user.organizationId } });
  if (!company) throw new Error("Empresa inválida");

  const salaryMinRaw = String(formData.get("salaryMin") || "");
  const salaryMaxRaw = String(formData.get("salaryMax") || "");
  const deadlineRaw = String(formData.get("deadline") || "");

  const job = await db.job.update({
    where: { id: jobId },
    data: {
      companyId,
      title,
      description: String(formData.get("description") || ""),
      requirements: String(formData.get("requirements") || ""),
      niceToHave: String(formData.get("niceToHave") || "") || null,
      salaryMin: salaryMinRaw ? Number(salaryMinRaw) : null,
      salaryMax: salaryMaxRaw ? Number(salaryMaxRaw) : null,
      contractType: (String(formData.get("contractType") || "CLT") as any),
      workModel: (String(formData.get("workModel") || "ON_SITE") as any),
      location: String(formData.get("location") || "") || null,
      openings: Number(formData.get("openings") || 1),
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      responsibleId: String(formData.get("responsibleId") || "") || null,
      priority: String(formData.get("priority") || "NORMAL"),
    },
  });

  await logActivity(user.organizationId, user.id, "JOB_UPDATED", `Vaga "${job.title}" foi atualizada.`);

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  redirect(`/jobs/${jobId}`);
}

export async function archiveJob(jobId: string) {
  const user = await requireSession();

  const job = await db.job.findFirst({ where: { id: jobId, organizationId: user.organizationId } });
  if (!job) throw new Error("Vaga não encontrada");

  await db.job.update({ where: { id: jobId }, data: { archived: true, archivedAt: new Date() } });

  await logActivity(user.organizationId, user.id, "JOB_ARCHIVED", `Vaga "${job.title}" foi arquivada.`);

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}

export async function restoreJob(jobId: string) {
  const user = await requireSession();

  const job = await db.job.findFirst({ where: { id: jobId, organizationId: user.organizationId } });
  if (!job) throw new Error("Vaga não encontrada");

  await db.job.update({ where: { id: jobId }, data: { archived: false, archivedAt: null } });

  await logActivity(user.organizationId, user.id, "JOB_RESTORED", `Vaga "${job.title}" foi restaurada.`);

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}

export async function updateJobStatus(jobId: string, status: string) {
  const user = await requireSession();

  const job = await db.job.findFirst({ where: { id: jobId, organizationId: user.organizationId } });
  if (!job) throw new Error("Vaga não encontrada");

  await db.job.update({
    where: { id: jobId },
    data: { status: status as any, openedAt: status === "OPEN" && !job.openedAt ? new Date() : job.openedAt },
  });

  await logActivity(user.organizationId, user.id, "JOB_STATUS_CHANGED", `Status da vaga "${job.title}" alterado.`);

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

// ============================================================
// CANDIDATOS
// ============================================================

export async function createCandidate(formData: FormData) {
  const user = await requireSession();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!name || !email) throw new Error("Nome e email são obrigatórios");

  const existing = await db.candidate.findFirst({
    where: { organizationId: user.organizationId, email },
  });
  if (existing) throw new Error("Já existe um candidato com este email.");

  const candidate = await db.candidate.create({
    data: {
      organizationId: user.organizationId,
      name,
      email,
      phone: String(formData.get("phone") || "") || null,
      city: String(formData.get("city") || "") || null,
      desiredRole: String(formData.get("desiredRole") || "") || null,
      desiredRoles: String(formData.get("desiredRoles") || "") || null,
      professionalSummary: String(formData.get("professionalSummary") || "") || null,

      birthDate: formData.get("birthDate")
        ? new Date(String(formData.get("birthDate")))
        : null,

      secondaryEmail: String(formData.get("secondaryEmail") || "") || null,

      linkedin: String(formData.get("linkedin") || "") || null,
      portfolio: String(formData.get("portfolio") || "") || null,

      education: String(formData.get("education") || "") || null,
      courses: String(formData.get("courses") || "") || null,
      experience: String(formData.get("experience") || "") || null,
      skills: String(formData.get("skills") || "") || null,
      languages: String(formData.get("languages") || "") || null,

      salaryExpectation: formData.get("salaryExpectation")
        ? Number(formData.get("salaryExpectation"))
        : null,

      hasDriverLicense:
        formData.get("hasDriverLicense") === "true"
          ? true
          : formData.get("hasDriverLicense") === "false"
            ? false
            : null,

      driverLicenseCategory:
        String(formData.get("driverLicenseCategory") || "") || null,

      gender: String(formData.get("gender") || "") || null,
      race: String(formData.get("race") || "") || null,
      sexualOrientation: String(formData.get("sexualOrientation") || "") || null,
      genderIdentity: String(formData.get("genderIdentity") || "") || null,

      address: String(formData.get("address") || "") || null,
      country: String(formData.get("country") || "") || null,

      notes: String(formData.get("notes") || "") || null,
    },
  });

  const jobId = String(formData.get("jobId") || "");
  if (jobId) {
    const job = await db.job.findFirst({ where: { id: jobId, organizationId: user.organizationId } });
    if (job) {
      await db.application.create({
        data: { jobId, candidateId: candidate.id, stage: "NEW" },
      });
    }
  }

  await logActivity(
    user.organizationId,
    user.id,
    "CANDIDATE_CREATED",
    `Candidato "${candidate.name}" foi cadastrado.`,
    candidate.id
  );

  revalidatePath("/candidates");
  redirect(`/candidates/${candidate.id}`);
}

export async function updateCandidate(candidateId: string, formData: FormData) {
  const user = await requireSession();

  const existing = await db.candidate.findFirst({ where: { id: candidateId, organizationId: user.organizationId } });
  if (!existing) throw new Error("Candidato não encontrado");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!name || !email) throw new Error("Nome e email são obrigatórios");

  if (email !== existing.email) {
    const duplicate = await db.candidate.findFirst({
      where: { organizationId: user.organizationId, email, id: { not: candidateId } },
    });
    if (duplicate) throw new Error("Já existe um candidato com este email.");
  }

  const candidate = await db.candidate.update({
    where: { id: candidateId },
    data: {
      name,
      email,
      phone: String(formData.get("phone") || "") || null,
      city: String(formData.get("city") || "") || null,
      desiredRole: String(formData.get("desiredRole") || "") || null,
      desiredRoles: String(formData.get("desiredRoles") || "") || null,
      professionalSummary: String(formData.get("professionalSummary") || "") || null,

      birthDate: formData.get("birthDate")
        ? new Date(String(formData.get("birthDate")))
        : null,

      secondaryEmail: String(formData.get("secondaryEmail") || "") || null,

      linkedin: String(formData.get("linkedin") || "") || null,
      portfolio: String(formData.get("portfolio") || "") || null,

      education: String(formData.get("education") || "") || null,
      courses: String(formData.get("courses") || "") || null,
      experience: String(formData.get("experience") || "") || null,
      skills: String(formData.get("skills") || "") || null,
      languages: String(formData.get("languages") || "") || null,

      salaryExpectation: formData.get("salaryExpectation")
        ? Number(formData.get("salaryExpectation"))
        : null,

      hasDriverLicense:
        formData.get("hasDriverLicense") === "true"
          ? true
          : formData.get("hasDriverLicense") === "false"
            ? false
            : null,

      driverLicenseCategory:
        String(formData.get("driverLicenseCategory") || "") || null,

      gender: String(formData.get("gender") || "") || null,
      race: String(formData.get("race") || "") || null,
      sexualOrientation: String(formData.get("sexualOrientation") || "") || null,
      genderIdentity: String(formData.get("genderIdentity") || "") || null,

      address: String(formData.get("address") || "") || null,
      country: String(formData.get("country") || "") || null,

      notes: String(formData.get("notes") || "") || null,
    },
  });

  await logActivity(
    user.organizationId,
    user.id,
    "CANDIDATE_UPDATED",
    `Candidato "${candidate.name}" foi atualizado.`,
    candidate.id
  );

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${candidateId}`);
  redirect(`/candidates/${candidateId}`);
}

export async function deleteCandidate(candidateId: string) {
  const user = await requireSession();

  const candidate = await db.candidate.findFirst({
    where: {
      id: candidateId,
      organizationId: user.organizationId,
    },
    include: {
      applications: true,
    },
  });

  if (!candidate) {
    throw new Error("Candidato não encontrado");
  }

  if (candidate.applications.length > 0) {
    throw new Error(
      "Não é possível excluir definitivamente um candidato que possui candidaturas vinculadas. Arquive o candidato em vez disso."
    );
  }

  await db.resume.deleteMany({
    where: {
      candidateId,
    },
  });

  await db.candidate.delete({
    where: {
      id: candidateId,
    },
  });

  revalidatePath("/candidates");
  revalidatePath("/dashboard");
}

export async function archiveCandidate(candidateId: string) {
  const user = await requireSession();

  const candidate = await db.candidate.findFirst({ where: { id: candidateId, organizationId: user.organizationId } });
  if (!candidate) throw new Error("Candidato não encontrado");

  await db.candidate.update({ where: { id: candidateId }, data: { archived: true, archivedAt: new Date() } });

  await logActivity(
    user.organizationId,
    user.id,
    "CANDIDATE_ARCHIVED",
    `Candidato "${candidate.name}" foi arquivado.`,
    candidate.id
  );

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${candidateId}`);
}

export async function restoreCandidate(candidateId: string) {
  const user = await requireSession();

  const candidate = await db.candidate.findFirst({ where: { id: candidateId, organizationId: user.organizationId } });
  if (!candidate) throw new Error("Candidato não encontrado");

  await db.candidate.update({ where: { id: candidateId }, data: { archived: false, archivedAt: null } });

  await logActivity(
    user.organizationId,
    user.id,
    "CANDIDATE_RESTORED",
    `Candidato "${candidate.name}" foi restaurado.`,
    candidate.id
  );

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${candidateId}`);
}

// ============================================================
// PIPELINE (Kanban)
// ============================================================

export async function moveApplicationStage(applicationId: string, toStage: PipelineStage) {
  const user = await requireSession();

  const application = await db.application.findFirst({
    where: { id: applicationId, job: { organizationId: user.organizationId } },
    include: { candidate: true, job: true },
  });
  if (!application) throw new Error("Candidatura não encontrada");

  await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: {
        stage: toStage,
        isFinalist: toStage === "APPROVED" || toStage === "CLIENT_INTERVIEW" || application.isFinalist,
      },
    }),
    db.stageHistory.create({
      data: {
        applicationId,
        fromStage: application.stage,
        toStage,
        changedByName: user.name,
      },
    }),
  ]);

  await logActivity(
    user.organizationId,
    user.id,
    "STAGE_CHANGE",
    `${application.candidate.name} foi movido para a etapa "${toStage}" na vaga "${application.job.title}".`,
    application.candidateId
  );

  revalidatePath(`/pipeline`);
  revalidatePath(`/candidates/${application.candidateId}`);
}

export async function addCandidateToJob(candidateId: string, jobId: string) {
  const user = await requireSession();

  const [candidate, job] = await Promise.all([
    db.candidate.findFirst({
      where: {
        id: candidateId,
        organizationId: user.organizationId,
      },
    }),
    db.job.findFirst({
      where: {
        id: jobId,
        organizationId: user.organizationId,
      },
    }),
  ]);

  if (!candidate || !job) {
    throw new Error("Candidato ou vaga inválidos");
  }

  const existing = await db.application.findFirst({
    where: { candidateId, jobId },
  });

  if (existing) return existing;

  const application = await db.application.create({
    data: {
      candidateId,
      jobId,
      stage: "NEW",
    },
  });

  try {
    const analysis = await aiService.matchCandidateToJob(job, candidate);

    await db.application.update({
      where: { id: application.id },
      data: {
        aiMatchScore: analysis.matchScore,
        aiAnalysisJson: JSON.stringify(analysis),
      },
    });
  } catch (error) {
    console.error("Erro ao analisar compatibilidade do candidato:", error);
  }

  await logActivity(
    user.organizationId,
    user.id,
    "APPLICATION_CREATED",
    `${candidate.name} foi adicionado à vaga "${job.title}".`,
    candidate.id
  );

  revalidatePath("/pipeline");
  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath(`/jobs/${jobId}`);

  return application;
}

export async function removeCandidateFromJob(applicationId: string) {
  const user = await requireSession();

  const application = await db.application.findFirst({
    where: {
      id: applicationId,
      job: {
        organizationId: user.organizationId,
      },
    },
    include: {
      candidate: true,
      job: true,
    },
  });

  if (!application) throw new Error("Candidatura não encontrada");

  await db.$transaction(async (tx) => {
    await tx.stageHistory.deleteMany({
      where: { applicationId },
    });

    await tx.application.delete({
      where: { id: applicationId },
    });
  });

  await logActivity(
    user.organizationId,
    user.id,
    "APPLICATION_REMOVED",
    `${application.candidate.name} foi removido da vaga "${application.job.title}".`,
    application.candidateId
  );

  revalidatePath(`/jobs/${application.jobId}`);
  revalidatePath(`/candidates/${application.candidateId}`);
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}



// ============================================================
// ENTREVISTAS
// ============================================================

export async function createInterview(formData: FormData) {
  const user = await requireSession();

  const candidateId = String(formData.get("candidateId") || "");
  const jobId = String(formData.get("jobId") || "");
  const interviewerId = String(formData.get("interviewerId") || "");
  const dateRaw = String(formData.get("date") || "");
  const timeRaw = String(formData.get("time") || "");

  if (!candidateId || !jobId || !interviewerId || !dateRaw || !timeRaw) {
    throw new Error("Candidato, vaga, entrevistador, data e horário são obrigatórios");
  }

  const [candidate, job, interviewer] = await Promise.all([
    db.candidate.findFirst({ where: { id: candidateId, organizationId: user.organizationId } }),
    db.job.findFirst({ where: { id: jobId, organizationId: user.organizationId } }),
    db.user.findFirst({ where: { id: interviewerId, organizationId: user.organizationId } }),
  ]);
  if (!candidate || !job || !interviewer) throw new Error("Candidato, vaga ou entrevistador inválidos");

  const scheduledAt = new Date(`${dateRaw}T${timeRaw}`);
  if (Number.isNaN(scheduledAt.getTime())) throw new Error("Data/horário inválidos");

  const interview = await db.interview.create({
    data: {
      organizationId: user.organizationId,
      candidateId,
      jobId,
      interviewerId,
      scheduledAt,
      type: (String(formData.get("type") || "VIDEO") as any),
      meetingLink: String(formData.get("meetingLink") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      status: "SCHEDULED",
    },
  });

  await logActivity(
    user.organizationId,
    user.id,
    "INTERVIEW_CREATED",
    `Entrevista agendada com ${candidate.name} para a vaga "${job.title}".`,
    candidate.id
  );

  revalidatePath("/interviews");
  revalidatePath(`/candidates/${candidateId}`);
  redirect(`/interviews`);
}

export async function updateInterview(interviewId: string, formData: FormData) {
  const user = await requireSession();

  const existing = await db.interview.findFirst({ where: { id: interviewId, organizationId: user.organizationId } });
  if (!existing) throw new Error("Entrevista não encontrada");

  const interviewerId = String(formData.get("interviewerId") || "");
  const dateRaw = String(formData.get("date") || "");
  const timeRaw = String(formData.get("time") || "");
  if (!interviewerId || !dateRaw || !timeRaw) throw new Error("Entrevistador, data e horário são obrigatórios");

  const interviewer = await db.user.findFirst({ where: { id: interviewerId, organizationId: user.organizationId } });
  if (!interviewer) throw new Error("Entrevistador inválido");

  const scheduledAt = new Date(`${dateRaw}T${timeRaw}`);
  if (Number.isNaN(scheduledAt.getTime())) throw new Error("Data/horário inválidos");

  await db.interview.update({
    where: { id: interviewId },
    data: {
      interviewerId,
      scheduledAt,
      type: (String(formData.get("type") || "VIDEO") as any),
      meetingLink: String(formData.get("meetingLink") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });

  await logActivity(user.organizationId, user.id, "INTERVIEW_UPDATED", `Entrevista foi atualizada.`, existing.candidateId);

  revalidatePath("/interviews");
  revalidatePath(`/candidates/${existing.candidateId}`);
  redirect(`/interviews`);
}

export async function cancelInterview(interviewId: string) {
  const user = await requireSession();

  const interview = await db.interview.findFirst({
    where: { id: interviewId, organizationId: user.organizationId },
    include: { candidate: true },
  });
  if (!interview) throw new Error("Entrevista não encontrada");

  await db.interview.update({ where: { id: interviewId }, data: { status: "CANCELED" } });

  await logActivity(
    user.organizationId,
    user.id,
    "INTERVIEW_CANCELED",
    `Entrevista com ${interview.candidate.name} foi cancelada.`,
    interview.candidateId
  );

  revalidatePath("/interviews");
  revalidatePath(`/candidates/${interview.candidateId}`);
}

export async function markInterviewDone(interviewId: string) {
  const user = await requireSession();

  const interview = await db.interview.findFirst({
    where: { id: interviewId, organizationId: user.organizationId },
    include: { candidate: true },
  });
  if (!interview) throw new Error("Entrevista não encontrada");

  await db.interview.update({ where: { id: interviewId }, data: { status: "DONE" } });

  await logActivity(
    user.organizationId,
    user.id,
    "INTERVIEW_DONE",
    `Entrevista com ${interview.candidate.name} foi marcada como realizada.`,
    interview.candidateId
  );

  revalidatePath("/interviews");
  revalidatePath(`/candidates/${interview.candidateId}`);
}

// ============================================================
// AUDITORIA / ATIVIDADES
// ============================================================

export async function logActivity(
  organizationId: string,
  userId: string | null,
  type: string,
  description: string,
  candidateId?: string
) {
  await db.activity.create({
    data: { organizationId, userId, type, description, candidateId },
  });

  if (userId) {
    const notificationTitles: Record<string, string> = {
      CANDIDATE_CREATED: "Novo candidato",
      CANDIDATE_UPDATED: "Candidato atualizado",
      CANDIDATE_STAGE_CHANGED: "Candidato avançou de etapa",
      INTERVIEW_CREATED: "Nova entrevista",
      JOB_CREATED: "Nova vaga",
      JOB_UPDATED: "Vaga atualizada",
      CANDIDATE_HIRED: "Candidato contratado",
    };

    await db.notification.create({
      data: {
        organizationId,
        userId,
        title: notificationTitles[type] ?? "Nova atividade",
        message: description,
      },
    });
  }
}

export async function deactivateUser(userId: string) {
  const user = await requireSession();

  if (user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para realizar esta ação.");
  }

  const member = await db.user.findFirst({
    where: {
      id: userId,
      organizationId: user.organizationId,
    },
  });

  if (!member) {
    throw new Error("Usuário não encontrado.");
  }

  if (member.id === user.id) {
    throw new Error("Você não pode desativar seu próprio usuário.");
  }

  await db.user.update({
    where: {
      id: member.id,
    },
    data: {
      active: false,
    },
  });

  revalidatePath("/team");
}

// ============================================================
// CONFIGURAÇÕES
// ============================================================

export async function updateProfile(data: {
  name: string;
  email: string;
}) {
  const user = await requireSession();

  const name = data.name.trim();
  const email = data.email.toLowerCase().trim();

  if (!name) throw new Error("O nome é obrigatório.");
  if (!email) throw new Error("O email é obrigatório.");

  const member = await db.user.findFirst({
    where: {
      id: user.id,
      organizationId: user.organizationId,
      active: true,
    },
  });

  if (!member) {
    throw new Error("Usuário não encontrado ou desativado.");
  }

  const emailInUse = await db.user.findFirst({
    where: {
      email,
      NOT: { id: member.id },
    },
  });

  if (emailInUse) {
    throw new Error("Este email já está sendo usado.");
  }

  await db.user.update({
    where: { id: member.id },
    data: {
      name,
      email,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const user = await requireSession();

  if (!data.currentPassword || !data.newPassword) {
    throw new Error("Preencha todos os campos.");
  }

  if (data.newPassword.length < 6) {
    throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
  }

  const member = await db.user.findFirst({
    where: {
      id: user.id,
      organizationId: user.organizationId,
      active: true,
    },
  });

  if (!member) {
    throw new Error("Usuário não encontrado ou desativado.");
  }

  const valid = await bcrypt.compare(
    data.currentPassword,
    member.passwordHash
  );

  if (!valid) {
    throw new Error("A senha atual está incorreta.");
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);

  await db.user.update({
    where: { id: member.id },
    data: {
      passwordHash,
    },
  });

  revalidatePath("/settings");
}

export async function updateOrganization(data: {
  name: string;
  slug: string;
}) {
  const user = await requireSession();

  if (user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para alterar a organização.");
  }

  const name = data.name.trim();
  const slug = data.slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  if (!name) throw new Error("O nome da organização é obrigatório.");
  if (!slug) throw new Error("O slug da organização é obrigatório.");

  const existing = await db.organization.findFirst({
    where: {
      slug,
      NOT: { id: user.organizationId },
    },
  });

  if (existing) {
    throw new Error("Este slug já está sendo usado.");
  }

  await db.organization.update({
    where: { id: user.organizationId },
    data: {
      name,
      slug,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}




// ============================================================
// NOTIFICAÇÕES
// ============================================================

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireSession();

  const notification = await db.notification.findFirst({
    where: {
      id: notificationId,
      userId: user.id,
      organizationId: user.organizationId,
    },
  });

  if (!notification) {
    throw new Error("Notificação não encontrada.");
  }

  await db.notification.update({
    where: { id: notification.id },
    data: { read: true },
  });

  revalidatePath("/dashboard");
}

export async function markAllNotificationsAsRead() {
  const user = await requireSession();

  await db.notification.updateMany({
    where: {
      userId: user.id,
      organizationId: user.organizationId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  revalidatePath("/dashboard");
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
}) {
  const user = await requireSession();

  if (user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para criar notificações.");
  }

  await db.notification.create({
    data: {
      userId: data.userId,
      organizationId: user.organizationId,
      title: data.title,
      message: data.message,
    },
  });

  revalidatePath("/dashboard");
}
