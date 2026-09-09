-- Criar novo enum com 12 valores
CREATE TYPE "PipelineStage_new" AS ENUM (
  'NEW', 'SCREENING', 'CONTACT', 'INTERVIEW',
  'APPROVED_INTERVIEW', 'CLIENT_INTERVIEW', 'APPROVED_CLIENT',
  'TEST', 'HIRED', 'DISQUALIFICATION', 'REPROVED', 'WITHDRAWAL'
);

-- Migrar Application.stage (tabela vazia, conversão direta)
ALTER TABLE "Application" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "stage" TYPE "PipelineStage_new" USING "stage"::text::"PipelineStage_new";
ALTER TABLE "Application" ALTER COLUMN "stage" SET DEFAULT 'NEW';

-- Migrar StageHistory.fromStage (nullable)
ALTER TABLE "StageHistory" ALTER COLUMN "fromStage" TYPE "PipelineStage_new" USING "fromStage"::text::"PipelineStage_new";

-- Migrar StageHistory.toStage
ALTER TABLE "StageHistory" ALTER COLUMN "toStage" TYPE "PipelineStage_new" USING "toStage"::text::"PipelineStage_new";

-- Trocar enum antigo pelo novo
ALTER TYPE "PipelineStage" RENAME TO "PipelineStage_old";
ALTER TYPE "PipelineStage_new" RENAME TO "PipelineStage";
DROP TYPE "PipelineStage_old";

-- Adicionar colunas novas em StageHistory
ALTER TABLE "StageHistory" ADD COLUMN "disqualificationType" TEXT;
ALTER TABLE "StageHistory" ADD COLUMN "occurredAt" TIMESTAMP(3);
