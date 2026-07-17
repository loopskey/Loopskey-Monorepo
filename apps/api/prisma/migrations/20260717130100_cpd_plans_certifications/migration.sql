-- CreateEnum
CREATE TYPE "CPDPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CPDEvidenceType" AS ENUM ('CERTIFICATE', 'ATTENDANCE_PROOF', 'SELF_DECLARATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CPDReminderTiming" AS ENUM ('DAYS_7', 'DAYS_14', 'DAYS_30', 'DAYS_60');

-- CreateEnum
CREATE TYPE "CPDReportRecipientType" AS ENUM ('SELF', 'MANAGER', 'ORGANIZATION', 'ASSOCIATION', 'OTHER');

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "organizationAbbr" TEXT,
    "association" TEXT,
    "creditType" "CreditType" NOT NULL DEFAULT 'CPD',
    "renewalCycleLabel" TEXT NOT NULL,
    "renewalCycleMonths" INTEGER,
    "totalRequiredCredits" DOUBLE PRECISION NOT NULL,
    "suggestedDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationCategory" (
    "id" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requiredCredits" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CertificationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPDPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificationId" TEXT,
    "certificationName" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "reportingStart" TIMESTAMP(3) NOT NULL,
    "reportingEnd" TIMESTAMP(3) NOT NULL,
    "creditType" "CreditType" NOT NULL DEFAULT 'CPD',
    "totalRequiredCredits" DOUBLE PRECISION NOT NULL,
    "initialCompletedCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeAvailable" "LearningTimeCommitment",
    "preferredFormats" "LearningFormat"[],
    "evidenceTypes" "CPDEvidenceType"[],
    "evidenceOtherNote" TEXT,
    "reportRecipientType" "CPDReportRecipientType" NOT NULL DEFAULT 'SELF',
    "reportRecipientLabel" TEXT,
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTiming" "CPDReminderTiming",
    "status" "CPDPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CPDPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPDPlanCategory" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CPDPlanCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Certification_abbreviation_idx" ON "Certification"("abbreviation");

-- CreateIndex
CREATE INDEX "Certification_organization_idx" ON "Certification"("organization");

-- CreateIndex
CREATE INDEX "CertificationCategory_certificationId_idx" ON "CertificationCategory"("certificationId");

-- CreateIndex
CREATE INDEX "CPDPlan_userId_idx" ON "CPDPlan"("userId");

-- CreateIndex
CREATE INDEX "CPDPlan_certificationId_idx" ON "CPDPlan"("certificationId");

-- CreateIndex
CREATE INDEX "CPDPlan_status_idx" ON "CPDPlan"("status");

-- CreateIndex
CREATE INDEX "CPDPlan_userId_reportingStart_reportingEnd_idx" ON "CPDPlan"("userId", "reportingStart", "reportingEnd");

-- CreateIndex
CREATE INDEX "CPDPlanCategory_planId_idx" ON "CPDPlanCategory"("planId");

-- AddForeignKey
ALTER TABLE "CertificationCategory" ADD CONSTRAINT "CertificationCategory_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CPDPlan" ADD CONSTRAINT "CPDPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CPDPlan" ADD CONSTRAINT "CPDPlan_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CPDPlanCategory" ADD CONSTRAINT "CPDPlanCategory_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CPDPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable trigram fuzzy search for the certification catalogue. pg_trgm powers the
-- similarity() ranking and the GIN indexes below back the certification lookup query.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex (trigram GIN for fuzzy certification search)
CREATE INDEX "Certification_name_trgm_idx" ON "Certification" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Certification_abbreviation_trgm_idx" ON "Certification" USING GIN ("abbreviation" gin_trgm_ops);
CREATE INDEX "Certification_organization_trgm_idx" ON "Certification" USING GIN ("organization" gin_trgm_ops);
CREATE INDEX "Certification_organizationAbbr_trgm_idx" ON "Certification" USING GIN ("organizationAbbr" gin_trgm_ops);
CREATE INDEX "Certification_association_trgm_idx" ON "Certification" USING GIN ("association" gin_trgm_ops);
