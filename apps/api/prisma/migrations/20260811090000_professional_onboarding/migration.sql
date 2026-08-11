-- Professional onboarding: goal, wizard state, role taxonomy and catalogue-linked credentials.

-- CreateEnum
CREATE TYPE "ProfessionalGoal" AS ENUM ('MAINTAIN_CERTIFICATION', 'GROW_IN_CURRENT_ROLE', 'PREPARE_FOR_NEXT_ROLE', 'EXPLORE_PROFESSIONAL_PATH');

-- AlterEnum
ALTER TYPE "ProfileTaxonomyKind" ADD VALUE 'ROLE';

-- AlterTable
ALTER TABLE "ProfessionalProfile"
  ADD COLUMN "professionalGoal" "ProfessionalGoal",
  ADD COLUMN "onboardingStartedAt" TIMESTAMP(3),
  ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

-- Existing professionals keep their profile untouched: anyone who already
-- entered profile data is treated as onboarded so the wizard never interrupts
-- an account that is already in use.
UPDATE "ProfessionalProfile"
SET "onboardingCompletedAt" = "createdAt"
WHERE "currentRole" IS NOT NULL
   OR "profession" IS NOT NULL
   OR "industry" IS NOT NULL
   OR "experienceRange" IS NOT NULL;

-- AlterTable
ALTER TABLE "ProfessionalCredential"
  ALTER COLUMN "issuingOrganization" DROP NOT NULL,
  ALTER COLUMN "issueDate" DROP NOT NULL,
  ADD COLUMN "certificationId" TEXT;

-- AddForeignKey
ALTER TABLE "ProfessionalCredential" ADD CONSTRAINT "ProfessionalCredential_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalCredential_userId_certificationId_key" ON "ProfessionalCredential"("userId", "certificationId");
