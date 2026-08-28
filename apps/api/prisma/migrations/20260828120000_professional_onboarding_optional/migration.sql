-- Onboarding became optional: the wizard is offered once and the professional
-- may walk away from it, so the profile records that dismissal alongside the
-- start and completion timestamps.

-- AlterTable
ALTER TABLE "ProfessionalProfile"
  ADD COLUMN "onboardingDismissedAt" TIMESTAMP(3);
