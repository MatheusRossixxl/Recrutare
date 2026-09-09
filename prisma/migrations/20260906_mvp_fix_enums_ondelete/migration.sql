-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECRUITER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CLT', 'PJ', 'INTERNSHIP', 'TEMPORARY', 'FREELANCE');

-- CreateEnum
CREATE TYPE "WorkModel" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('NEW', 'SCREENING', 'INTERVIEW', 'TEST', 'CLIENT_INTERVIEW', 'APPROVED', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'DONE', 'CANCELED', 'RESCHEDULED');

-- DropForeignKey (temporário — será recriado com onDelete)
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";
ALTER TABLE "Company" DROP CONSTRAINT "Company_organizationId_fkey";
ALTER TABLE "Job" DROP CONSTRAINT "Job_organizationId_fkey";
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";
ALTER TABLE "Job" DROP CONSTRAINT "Job_responsibleId_fkey";
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_organizationId_fkey";
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_candidateId_fkey";
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";
ALTER TABLE "StageHistory" DROP CONSTRAINT "StageHistory_applicationId_fkey";
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_organizationId_fkey";
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_jobId_fkey";
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_candidateId_fkey";
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_interviewerId_fkey";
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_interviewId_fkey";
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_candidateId_fkey";
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_evaluatorId_fkey";
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_organizationId_fkey";
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_candidateId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_organizationId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- =============================================
-- Conversão SEGURA: DROP DEFAULT → ALTER TYPE USING → SET DEFAULT
-- Preserva dados existentes em vez de DROP + ADD
-- =============================================

-- User.role: String → UserRole
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'RECRUITER';

-- Job: 4 colunas String → Enum
ALTER TABLE "Job" ALTER COLUMN "contractType" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "contractType" TYPE "ContractType" USING "contractType"::"ContractType";
ALTER TABLE "Job" ALTER COLUMN "contractType" SET DEFAULT 'CLT';

ALTER TABLE "Job" ALTER COLUMN "workModel" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "workModel" TYPE "WorkModel" USING "workModel"::"WorkModel";
ALTER TABLE "Job" ALTER COLUMN "workModel" SET DEFAULT 'ON_SITE';

ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus" USING "status"::"JobStatus";
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

ALTER TABLE "Job" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "priority" TYPE "JobPriority" USING "priority"::"JobPriority";
ALTER TABLE "Job" ALTER COLUMN "priority" SET DEFAULT 'NORMAL';

-- Application.stage: String → PipelineStage
ALTER TABLE "Application" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "stage" TYPE "PipelineStage" USING "stage"::"PipelineStage";
ALTER TABLE "Application" ALTER COLUMN "stage" SET DEFAULT 'NEW';

-- StageHistory: 2 colunas String → PipelineStage
ALTER TABLE "StageHistory" ALTER COLUMN "fromStage" TYPE "PipelineStage" USING "fromStage"::"PipelineStage";
ALTER TABLE "StageHistory" ALTER COLUMN "toStage" TYPE "PipelineStage" USING "toStage"::"PipelineStage";

-- Interview: 2 colunas String → Enum
ALTER TABLE "Interview" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Interview" ALTER COLUMN "type" TYPE "InterviewType" USING "type"::"InterviewType";
ALTER TABLE "Interview" ALTER COLUMN "type" SET DEFAULT 'VIDEO';

ALTER TABLE "Interview" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Interview" ALTER COLUMN "status" TYPE "InterviewStatus" USING "status"::"InterviewStatus";
ALTER TABLE "Interview" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- =============================================
-- Coluna nova
-- =============================================
ALTER TABLE "Candidate" ADD COLUMN "behavioralProfiles" TEXT;

-- =============================================
-- Recriar FKs com onDelete adequado
-- =============================================
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Company" ADD CONSTRAINT "Company_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
