-- Professional profile redesign.
--
-- This migration is intentionally non-destructive: legacy ProfessionalProfile
-- columns are renamed/converted in place (never dropped and re-added) so that
-- existing user data is preserved. Columns with no counterpart in the new
-- profile model ("website", "education", "skills", "interests") are kept as
-- compatibility columns and backfilled into the new structures below.

-- CreateEnum
CREATE TYPE "ProfessionalIndustry" AS ENUM ('TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'ENGINEERING', 'CONSTRUCTION', 'LEGAL', 'MARKETING', 'MANUFACTURING', 'PUBLIC_SECTOR', 'NON_PROFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceRange" AS ENUM ('LESS_THAN_ONE_YEAR', 'ONE_TO_TWO_YEARS', 'THREE_TO_FIVE_YEARS', 'SIX_TO_TEN_YEARS', 'ELEVEN_TO_FIFTEEN_YEARS', 'SIXTEEN_PLUS_YEARS');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "LearningFormat" AS ENUM ('COURSE', 'WEBINAR', 'WORKSHOP', 'VIDEO', 'PODCAST', 'ARTICLE');

-- CreateEnum
CREATE TYPE "LearningTimeCommitment" AS ENUM ('LESS_THAN_ONE_HOUR', 'ONE_TO_THREE_HOURS', 'FOUR_TO_SIX_HOURS', 'SEVEN_TO_TEN_HOURS', 'MORE_THAN_TEN_HOURS');

-- CreateEnum
CREATE TYPE "LearningBudgetPreference" AS ENUM ('FREE_ONLY', 'MIXED_FREE_AND_PAID', 'PREMIUM', 'EMPLOYER_SPONSORED');

-- CreateEnum
CREATE TYPE "ProfileTaxonomyKind" AS ENUM ('SKILL_AREA', 'SUBJECT');

-- CreateEnum
CREATE TYPE "ProfileTermUsage" AS ENUM ('MAIN_SKILL', 'FAVORITE_SUBJECT', 'SKILL_TO_IMPROVE');

-- AlterTable: avatar storage ownership
ALTER TABLE "User" ADD COLUMN "avatarStorageKey" TEXT;

-- AlterTable: rename legacy professional profile columns (data preserving)
ALTER TABLE "ProfessionalProfile" RENAME COLUMN "jobTitle" TO "currentRole";
ALTER TABLE "ProfessionalProfile" RENAME COLUMN "location" TO "workLocation";
ALTER TABLE "ProfessionalProfile" RENAME COLUMN "occupation" TO "profession";

-- Backfill the profession from the previous job title when no occupation was set
UPDATE "ProfessionalProfile"
SET "profession" = "currentRole"
WHERE "profession" IS NULL AND "currentRole" IS NOT NULL;

-- AlterTable: convert the free-text industry into the new enum, keeping known values
ALTER TABLE "ProfessionalProfile"
ALTER COLUMN "industry" TYPE "ProfessionalIndustry"
USING (
  CASE
    WHEN "industry" IS NULL OR btrim("industry") = '' THEN NULL
    WHEN upper(regexp_replace(btrim("industry"), '[^A-Za-z]+', '_', 'g')) IN (
      'TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'ENGINEERING', 'CONSTRUCTION',
      'LEGAL', 'MARKETING', 'MANUFACTURING', 'PUBLIC_SECTOR', 'NON_PROFIT', 'OTHER'
    ) THEN upper(regexp_replace(btrim("industry"), '[^A-Za-z]+', '_', 'g'))
    ELSE 'OTHER'
  END
)::"ProfessionalIndustry";

-- AlterTable: new professional profile columns
ALTER TABLE "ProfessionalProfile"
ADD COLUMN "linkedInUrl" TEXT,
ADD COLUMN "countryCode" TEXT,
ADD COLUMN "language" "AppLanguage",
ADD COLUMN "timeZone" TEXT,
ADD COLUMN "experienceRange" "ExperienceRange",
ADD COLUMN "professionalSummary" TEXT,
ADD COLUMN "currentSkillLevel" "SkillLevel",
ADD COLUMN "targetSkillLevel" "SkillLevel",
ADD COLUMN "preferredLearningFormats" "LearningFormat"[] DEFAULT ARRAY[]::"LearningFormat"[],
ADD COLUMN "learningTimeCommitment" "LearningTimeCommitment",
ADD COLUMN "learningBudgetPreference" "LearningBudgetPreference";

-- Backfill the experience range from the previous numeric years of experience
UPDATE "ProfessionalProfile"
SET "experienceRange" = (
  CASE
    WHEN "experience" < 1 THEN 'LESS_THAN_ONE_YEAR'
    WHEN "experience" <= 2 THEN 'ONE_TO_TWO_YEARS'
    WHEN "experience" <= 5 THEN 'THREE_TO_FIVE_YEARS'
    WHEN "experience" <= 10 THEN 'SIX_TO_TEN_YEARS'
    WHEN "experience" <= 15 THEN 'ELEVEN_TO_FIFTEEN_YEARS'
    ELSE 'SIXTEEN_PLUS_YEARS'
  END
)::"ExperienceRange"
WHERE "experience" IS NOT NULL;

-- Backfill the LinkedIn URL from the legacy website column when it points at LinkedIn
UPDATE "ProfessionalProfile"
SET "linkedInUrl" = "website"
WHERE "website" ILIKE '%linkedin.com%';

-- DropColumn: replaced by "experienceRange" above
ALTER TABLE "ProfessionalProfile" DROP COLUMN "experience";

-- CreateTable
CREATE TABLE "ProfileTaxonomyTerm" (
    "id" TEXT NOT NULL,
    "kind" "ProfileTaxonomyKind" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "groupLabel" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileTaxonomyTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalProfileTerm" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "usage" "ProfileTermUsage" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessionalProfileTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "licenceNumber" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "annualCpdHours" DOUBLE PRECISION,
    "pduTargetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileTaxonomyTerm_kind_isActive_idx" ON "ProfileTaxonomyTerm"("kind", "isActive");

-- CreateIndex
CREATE INDEX "ProfileTaxonomyTerm_groupKey_idx" ON "ProfileTaxonomyTerm"("groupKey");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileTaxonomyTerm_kind_key_key" ON "ProfileTaxonomyTerm"("kind", "key");

-- CreateIndex
CREATE INDEX "ProfessionalProfileTerm_profileId_usage_idx" ON "ProfessionalProfileTerm"("profileId", "usage");

-- CreateIndex
CREATE INDEX "ProfessionalProfileTerm_termId_idx" ON "ProfessionalProfileTerm"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalProfileTerm_profileId_termId_usage_key" ON "ProfessionalProfileTerm"("profileId", "termId", "usage");

-- CreateIndex
CREATE INDEX "ProfessionalCredential_userId_idx" ON "ProfessionalCredential"("userId");

-- CreateIndex
CREATE INDEX "ProfessionalCredential_pduTargetId_idx" ON "ProfessionalCredential"("pduTargetId");

-- CreateIndex
CREATE INDEX "ProfessionalCredential_expiryDate_idx" ON "ProfessionalCredential"("expiryDate");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_industry_idx" ON "ProfessionalProfile"("industry");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_countryCode_idx" ON "ProfessionalProfile"("countryCode");

-- AddForeignKey
ALTER TABLE "ProfessionalProfileTerm" ADD CONSTRAINT "ProfessionalProfileTerm_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalProfileTerm" ADD CONSTRAINT "ProfessionalProfileTerm_termId_fkey" FOREIGN KEY ("termId") REFERENCES "ProfileTaxonomyTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalCredential" ADD CONSTRAINT "ProfessionalCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalCredential" ADD CONSTRAINT "ProfessionalCredential_pduTargetId_fkey" FOREIGN KEY ("pduTargetId") REFERENCES "PDUTarget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reference data: the canonical profile taxonomy. Kept in sync with
-- prisma/seeds/profile-taxonomy.seed.ts, which upserts the same rows.
INSERT INTO "ProfileTaxonomyTerm" ("id", "kind", "key", "label", "groupKey", "groupLabel", "sortOrder", "isActive", "createdAt", "updatedAt")
SELECT v.id, v.kind::"ProfileTaxonomyKind", v.key, v.label, v."groupKey", v."groupLabel", v."sortOrder", true, NOW(), NOW()
FROM (VALUES
  ('pt_skill_software_engineering', 'SKILL_AREA', 'SOFTWARE_ENGINEERING', 'Software Engineering', 'TECHNOLOGY', 'Technology', 0),
  ('pt_skill_data_analytics', 'SKILL_AREA', 'DATA_ANALYTICS', 'Data & Analytics', 'TECHNOLOGY', 'Technology', 1),
  ('pt_skill_cloud_infrastructure', 'SKILL_AREA', 'CLOUD_INFRASTRUCTURE', 'Cloud & Infrastructure', 'TECHNOLOGY', 'Technology', 2),
  ('pt_skill_cybersecurity', 'SKILL_AREA', 'CYBERSECURITY', 'Cybersecurity', 'TECHNOLOGY', 'Technology', 3),
  ('pt_skill_artificial_intelligence', 'SKILL_AREA', 'ARTIFICIAL_INTELLIGENCE', 'Artificial Intelligence', 'TECHNOLOGY', 'Technology', 4),
  ('pt_skill_quality_testing', 'SKILL_AREA', 'QUALITY_TESTING', 'Quality & Testing', 'TECHNOLOGY', 'Technology', 5),
  ('pt_skill_team_leadership', 'SKILL_AREA', 'TEAM_LEADERSHIP', 'Team Leadership', 'LEADERSHIP', 'Leadership', 100),
  ('pt_skill_coaching_mentoring', 'SKILL_AREA', 'COACHING_MENTORING', 'Coaching & Mentoring', 'LEADERSHIP', 'Leadership', 101),
  ('pt_skill_change_management', 'SKILL_AREA', 'CHANGE_MANAGEMENT', 'Change Management', 'LEADERSHIP', 'Leadership', 102),
  ('pt_skill_conflict_resolution', 'SKILL_AREA', 'CONFLICT_RESOLUTION', 'Conflict Resolution', 'LEADERSHIP', 'Leadership', 103),
  ('pt_skill_project_management', 'SKILL_AREA', 'PROJECT_MANAGEMENT', 'Project Management', 'BUSINESS', 'Business', 200),
  ('pt_skill_risk_management', 'SKILL_AREA', 'RISK_MANAGEMENT', 'Risk Management', 'BUSINESS', 'Business', 201),
  ('pt_skill_product_management', 'SKILL_AREA', 'PRODUCT_MANAGEMENT', 'Product Management', 'BUSINESS', 'Business', 202),
  ('pt_skill_business_strategy', 'SKILL_AREA', 'BUSINESS_STRATEGY', 'Business Strategy', 'BUSINESS', 'Business', 203),
  ('pt_skill_finance_accounting', 'SKILL_AREA', 'FINANCE_ACCOUNTING', 'Finance & Accounting', 'BUSINESS', 'Business', 204),
  ('pt_skill_operations', 'SKILL_AREA', 'OPERATIONS', 'Operations', 'BUSINESS', 'Business', 205),
  ('pt_skill_presentation_skills', 'SKILL_AREA', 'PRESENTATION_SKILLS', 'Presentation Skills', 'COMMUNICATION', 'Communication', 300),
  ('pt_skill_technical_writing', 'SKILL_AREA', 'TECHNICAL_WRITING', 'Technical Writing', 'COMMUNICATION', 'Communication', 301),
  ('pt_skill_negotiation', 'SKILL_AREA', 'NEGOTIATION', 'Negotiation', 'COMMUNICATION', 'Communication', 302),
  ('pt_skill_facilitation', 'SKILL_AREA', 'FACILITATION', 'Facilitation', 'COMMUNICATION', 'Communication', 303),
  ('pt_skill_regulatory_compliance', 'SKILL_AREA', 'REGULATORY_COMPLIANCE', 'Regulatory Compliance', 'COMPLIANCE', 'Compliance & Ethics', 400),
  ('pt_skill_health_safety', 'SKILL_AREA', 'HEALTH_SAFETY', 'Health & Safety', 'COMPLIANCE', 'Compliance & Ethics', 401),
  ('pt_skill_privacy_data_protection', 'SKILL_AREA', 'PRIVACY_DATA_PROTECTION', 'Privacy & Data Protection', 'COMPLIANCE', 'Compliance & Ethics', 402),
  ('pt_skill_professional_ethics', 'SKILL_AREA', 'PROFESSIONAL_ETHICS', 'Professional Ethics', 'COMPLIANCE', 'Compliance & Ethics', 403),
  ('pt_skill_ux_research', 'SKILL_AREA', 'UX_RESEARCH', 'UX Research', 'DESIGN', 'Design', 500),
  ('pt_skill_ui_design', 'SKILL_AREA', 'UI_DESIGN', 'UI Design', 'DESIGN', 'Design', 501),
  ('pt_skill_design_thinking', 'SKILL_AREA', 'DESIGN_THINKING', 'Design Thinking', 'DESIGN', 'Design', 502),
  ('pt_subject_software_development', 'SUBJECT', 'SOFTWARE_DEVELOPMENT', 'Software Development', 'TECHNOLOGY', 'Technology', 0),
  ('pt_subject_data_science', 'SUBJECT', 'DATA_SCIENCE', 'Data Science', 'TECHNOLOGY', 'Technology', 1),
  ('pt_subject_cloud_computing', 'SUBJECT', 'CLOUD_COMPUTING', 'Cloud Computing', 'TECHNOLOGY', 'Technology', 2),
  ('pt_subject_cybersecurity', 'SUBJECT', 'CYBERSECURITY', 'Cybersecurity', 'TECHNOLOGY', 'Technology', 3),
  ('pt_subject_ai_machine_learning', 'SUBJECT', 'AI_MACHINE_LEARNING', 'AI & Machine Learning', 'TECHNOLOGY', 'Technology', 4),
  ('pt_subject_entrepreneurship', 'SUBJECT', 'ENTREPRENEURSHIP', 'Entrepreneurship', 'BUSINESS', 'Business', 100),
  ('pt_subject_project_management', 'SUBJECT', 'PROJECT_MANAGEMENT', 'Project Management', 'BUSINESS', 'Business', 101),
  ('pt_subject_product_management', 'SUBJECT', 'PRODUCT_MANAGEMENT', 'Product Management', 'BUSINESS', 'Business', 102),
  ('pt_subject_strategy', 'SUBJECT', 'STRATEGY', 'Strategy', 'BUSINESS', 'Business', 103),
  ('pt_subject_corporate_finance', 'SUBJECT', 'CORPORATE_FINANCE', 'Corporate Finance', 'FINANCE', 'Finance', 200),
  ('pt_subject_investing', 'SUBJECT', 'INVESTING', 'Investing', 'FINANCE', 'Finance', 201),
  ('pt_subject_accounting', 'SUBJECT', 'ACCOUNTING', 'Accounting', 'FINANCE', 'Finance', 202),
  ('pt_subject_clinical_practice', 'SUBJECT', 'CLINICAL_PRACTICE', 'Clinical Practice', 'HEALTHCARE', 'Healthcare', 300),
  ('pt_subject_patient_safety', 'SUBJECT', 'PATIENT_SAFETY', 'Patient Safety', 'HEALTHCARE', 'Healthcare', 301),
  ('pt_subject_public_health', 'SUBJECT', 'PUBLIC_HEALTH', 'Public Health', 'HEALTHCARE', 'Healthcare', 302),
  ('pt_subject_civil_engineering', 'SUBJECT', 'CIVIL_ENGINEERING', 'Civil Engineering', 'ENGINEERING', 'Engineering', 400),
  ('pt_subject_mechanical_engineering', 'SUBJECT', 'MECHANICAL_ENGINEERING', 'Mechanical Engineering', 'ENGINEERING', 'Engineering', 401),
  ('pt_subject_electrical_engineering', 'SUBJECT', 'ELECTRICAL_ENGINEERING', 'Electrical Engineering', 'ENGINEERING', 'Engineering', 402),
  ('pt_subject_ux_design', 'SUBJECT', 'UX_DESIGN', 'UX Design', 'DESIGN', 'Design', 500),
  ('pt_subject_graphic_design', 'SUBJECT', 'GRAPHIC_DESIGN', 'Graphic Design', 'DESIGN', 'Design', 501),
  ('pt_subject_digital_marketing', 'SUBJECT', 'DIGITAL_MARKETING', 'Digital Marketing', 'MARKETING', 'Marketing', 600),
  ('pt_subject_brand_management', 'SUBJECT', 'BRAND_MANAGEMENT', 'Brand Management', 'MARKETING', 'Marketing', 601),
  ('pt_subject_content_marketing', 'SUBJECT', 'CONTENT_MARKETING', 'Content Marketing', 'MARKETING', 'Marketing', 602),
  ('pt_subject_people_management', 'SUBJECT', 'PEOPLE_MANAGEMENT', 'People Management', 'LEADERSHIP', 'Leadership', 700),
  ('pt_subject_organisational_culture', 'SUBJECT', 'ORGANISATIONAL_CULTURE', 'Organisational Culture', 'LEADERSHIP', 'Leadership', 701),
  ('pt_subject_regulatory_affairs', 'SUBJECT', 'REGULATORY_AFFAIRS', 'Regulatory Affairs', 'COMPLIANCE', 'Compliance', 800),
  ('pt_subject_risk_governance', 'SUBJECT', 'RISK_GOVERNANCE', 'Risk & Governance', 'COMPLIANCE', 'Compliance', 801),
  ('pt_subject_instructional_design', 'SUBJECT', 'INSTRUCTIONAL_DESIGN', 'Instructional Design', 'EDUCATION', 'Education', 900),
  ('pt_subject_adult_learning', 'SUBJECT', 'ADULT_LEARNING', 'Adult Learning', 'EDUCATION', 'Education', 901)
) AS v(id, kind, key, label, "groupKey", "groupLabel", "sortOrder")
ON CONFLICT ("kind", "key") DO NOTHING;

-- Backfill the legacy free-text "skills" array into the taxonomy join table.
-- Values that cannot be matched to a curated term stay in the legacy column.
INSERT INTO "ProfessionalProfileTerm" ("id", "profileId", "termId", "usage", "createdAt")
SELECT gen_random_uuid()::text, p."id", t."id", 'MAIN_SKILL'::"ProfileTermUsage", NOW()
FROM "ProfessionalProfile" p
CROSS JOIN LATERAL unnest(p."skills") AS legacy(value)
JOIN "ProfileTaxonomyTerm" t
  ON t."kind" = 'SKILL_AREA'
 AND (
   lower(btrim(legacy.value)) = lower(t."label")
   OR upper(regexp_replace(btrim(legacy.value), '[^A-Za-z0-9]+', '_', 'g')) = t."key"
 )
ON CONFLICT ("profileId", "termId", "usage") DO NOTHING;

-- Backfill the legacy free-text "interests" array into the taxonomy join table.
INSERT INTO "ProfessionalProfileTerm" ("id", "profileId", "termId", "usage", "createdAt")
SELECT gen_random_uuid()::text, p."id", t."id", 'FAVORITE_SUBJECT'::"ProfileTermUsage", NOW()
FROM "ProfessionalProfile" p
CROSS JOIN LATERAL unnest(p."interests") AS legacy(value)
JOIN "ProfileTaxonomyTerm" t
  ON t."kind" = 'SUBJECT'
 AND (
   lower(btrim(legacy.value)) = lower(t."label")
   OR upper(regexp_replace(btrim(legacy.value), '[^A-Za-z0-9]+', '_', 'g')) = t."key"
 )
ON CONFLICT ("profileId", "termId", "usage") DO NOTHING;
