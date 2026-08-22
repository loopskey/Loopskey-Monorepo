-- Roadmap chat data model: server-owned wizard drafts, their transcripts, and
-- per-step progress for generated roadmaps.
--
-- Existing roadmaps take the defaults below: a NULL "ownerId" and source
-- 'CATALOG'. That is what keeps explore results identical after this migration
-- runs. Existing enrollments gain no "RoadmapStepProgress" rows, so the derived
-- progress falls back to the "progress" integer they already carry and no
-- historical enrollment reports zero.

-- CreateEnum
CREATE TYPE "RoadmapSource" AS ENUM ('CATALOG', 'GENERATED');

-- CreateEnum
CREATE TYPE "RoadmapDraftStatus" AS ENUM ('COLLECTING', 'READY', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RoadmapChatRole" AS ENUM ('ASSISTANT', 'PROFESSIONAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RoadmapDraftStep" AS ENUM ('GOAL', 'GOAL_REASON', 'CONTEXT', 'TARGET_DATE', 'PREFERENCES', 'CPD_TRACKING', 'CERTIFICATION', 'CPD_REQUIREMENTS', 'REVIEW');

-- CreateEnum
CREATE TYPE "RoadmapStepProgressStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "coverageNote" TEXT,
ADD COLUMN     "estimatedWeeks" INTEGER,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "source" "RoadmapSource" NOT NULL DEFAULT 'CATALOG';

-- AlterTable
ALTER TABLE "RoadmapPhase" ADD COLUMN     "estimatedWeeks" INTEGER;

-- AlterTable
ALTER TABLE "RoadmapStep" ADD COLUMN     "estimatedMinutes" INTEGER;

-- AlterTable
ALTER TABLE "RoadmapEnrollment" ADD COLUMN     "draftId" TEXT,
ADD COLUMN     "targetDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RoadmapStepProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "RoadmapStepProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RoadmapDraftStatus" NOT NULL DEFAULT 'COLLECTING',
    "currentStep" "RoadmapDraftStep" NOT NULL DEFAULT 'GOAL',
    "goal" TEXT,
    "targetRole" TEXT,
    "goalReason" TEXT,
    "context" TEXT,
    "targetDate" TIMESTAMP(3),
    "skillLevel" "SkillLevel",
    "timeCommitment" "LearningTimeCommitment",
    "budgetPreference" "LearningBudgetPreference",
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredFormats" "LearningFormat"[] DEFAULT ARRAY[]::"LearningFormat"[],
    "preferredContentTypes" "ContentType"[] DEFAULT ARRAY[]::"ContentType"[],
    "cpdEnabled" BOOLEAN NOT NULL DEFAULT false,
    "certificationId" TEXT,
    "certificationName" TEXT,
    "cpdPlanId" TEXT,
    "requiredCredits" DOUBLE PRECISION,
    "completedCredits" DOUBLE PRECISION,
    "needsClarification" BOOLEAN NOT NULL DEFAULT false,
    "wasRefused" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapChatMessage" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "role" "RoadmapChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "stepKey" "RoadmapDraftStep" NOT NULL,
    "widget" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoadmapStepProgress_enrollmentId_idx" ON "RoadmapStepProgress"("enrollmentId");

-- CreateIndex
CREATE INDEX "RoadmapStepProgress_stepId_idx" ON "RoadmapStepProgress"("stepId");

-- CreateIndex
CREATE INDEX "RoadmapStepProgress_enrollmentId_status_idx" ON "RoadmapStepProgress"("enrollmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapStepProgress_enrollmentId_stepId_key" ON "RoadmapStepProgress"("enrollmentId", "stepId");

-- CreateIndex
CREATE INDEX "RoadmapDraft_userId_idx" ON "RoadmapDraft"("userId");

-- CreateIndex
CREATE INDEX "RoadmapDraft_userId_status_idx" ON "RoadmapDraft"("userId", "status");

-- CreateIndex
CREATE INDEX "RoadmapDraft_certificationId_idx" ON "RoadmapDraft"("certificationId");

-- CreateIndex
CREATE INDEX "RoadmapDraft_cpdPlanId_idx" ON "RoadmapDraft"("cpdPlanId");

-- CreateIndex
CREATE INDEX "RoadmapChatMessage_draftId_createdAt_idx" ON "RoadmapChatMessage"("draftId", "createdAt");

-- CreateIndex
CREATE INDEX "Roadmap_ownerId_idx" ON "Roadmap"("ownerId");

-- CreateIndex
CREATE INDEX "Roadmap_source_idx" ON "Roadmap"("source");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapEnrollment_draftId_key" ON "RoadmapEnrollment"("draftId");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapEnrollment" ADD CONSTRAINT "RoadmapEnrollment_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "RoadmapDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapStepProgress" ADD CONSTRAINT "RoadmapStepProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "RoadmapEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapStepProgress" ADD CONSTRAINT "RoadmapStepProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "RoadmapStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapDraft" ADD CONSTRAINT "RoadmapDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapDraft" ADD CONSTRAINT "RoadmapDraft_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapDraft" ADD CONSTRAINT "RoadmapDraft_cpdPlanId_fkey" FOREIGN KEY ("cpdPlanId") REFERENCES "CPDPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapChatMessage" ADD CONSTRAINT "RoadmapChatMessage_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "RoadmapDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

