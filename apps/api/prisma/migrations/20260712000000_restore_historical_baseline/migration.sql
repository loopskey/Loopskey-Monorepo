-- Restore the schema that existed before Prisma migration tracking covered all
-- application domains. Existing databases already have PDUTarget and skip this
-- compatibility body; a new database built from migrations does not.
DO $historical_baseline$
BEGIN
IF to_regclass('"PDUTarget"') IS NULL THEN

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('COURSE', 'WEBINAR', 'MEETING', 'EVENT', 'TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "AppLanguage" AS ENUM ('EN', 'FR');

-- CreateEnum
CREATE TYPE "PDUCategory" AS ENUM ('OTHER', 'ETHICS', 'BUSINESS', 'TECHNICAL', 'STRATEGIC', 'LEADERSHIP', 'COMPLIANCE', 'COMMUNICATION', 'DIGITAL_AI', 'RESEARCH_INNOVATION', 'INDUSTRY_KNOWLEDGE', 'PROFESSIONAL_PRACTICE');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('COMBO_PACKAGE', 'EMAIL_CAMPAIGN', 'FEATURED_LISTING', 'SOCIAL_MEDIA_BOOST');

-- CreateEnum
CREATE TYPE "PromotionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppTheme" AS ENUM ('DARK', 'LIGHT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY');

-- CreateEnum
CREATE TYPE "PDUStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PDUSource" AS ENUM ('EVENT', 'OTHER', 'COURSE', 'WEBINAR', 'PODCAST', 'YOUTUBE', 'WORKSHOP', 'SEMINAR', 'CONFERENCE', 'MEETING', 'TRAINING_SESSION', 'CERTIFICATION_PROGRAM', 'SELF_STUDY', 'READING_ARTICLE', 'VIDEO_LECTURE', 'MENTORSHIP', 'VOLUNTEERING', 'TEACHING', 'EXAM_ASSESSMENT');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('CPD', 'PDU', 'CEU', 'TRAINING_HOUR');

-- CreateEnum
CREATE TYPE "PDUCompletionStatus" AS ENUM ('COMPLETED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('DRAFT', 'ARCHIVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "RoadmapEnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'UNENROLLED');

-- CreateEnum
CREATE TYPE "OrganizationMemberStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ComplianceCycle" AS ENUM ('ANNUAL', 'BIANNUAL', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('HARD', 'SOFT');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AssignmentTargetKind" AS ENUM ('ALL', 'ROLE', 'MEMBER', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_EXPORTED', 'USER_STATUS_UPDATED', 'ORGANIZATION_VIEWED', 'ADMIN_PROFILE_UPDATED', 'ORGANIZATION_MEMBER_REMOVED', 'ORG_ACCESS_REQUEST_APPROVED', 'ORG_ACCESS_REQUEST_REJECTED', 'ORGANIZATION_MEMBER_UPDATED', 'ORGANIZATION_SETTINGS_UPDATED');

-- CreateEnum
CREATE TYPE "ExternalLearningProvider" AS ENUM ('EDX', 'UDEMY', 'OTHER', 'COURSERA', 'LINKEDIN_LEARNING');

-- CreateEnum
CREATE TYPE "ExternalLearningStatus" AS ENUM ('CLICKED', 'STARTED', 'IGNORED', 'REJECTED', 'VERIFIED', 'COMPLETED', 'EVIDENCE_UPLOADED', 'ENROLLED_CONFIRMED', 'ASKED_CONFIRMATION');

-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE 'CHANGE_EMAIL';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "earlyBirdDiscount" DOUBLE PRECISION,
ADD COLUMN     "earlyBirdDiscountPercent" DOUBLE PRECISION,
ADD COLUMN     "earlyBirdEndsAt" TIMESTAMP(3),
ADD COLUMN     "language" "AppLanguage" NOT NULL DEFAULT 'EN',
ADD COLUMN     "pduCategory" "PDUCategory",
ADD COLUMN     "promotionVideoUrl" TEXT,
ADD COLUMN     "promotionalVideoUrl" TEXT,
ADD COLUMN     "specificTopic" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "topic" TEXT;

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "education" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CalendarEventType" NOT NULL DEFAULT 'OTHER',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "contentType" "ContentType",
    "contentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSettings" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "organizationName" TEXT,
    "organizationProfile" TEXT,
    "aboutOrganization" TEXT,
    "contactEmail" TEXT,
    "newRegistrationAlertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "eventReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderHoursBeforeEvent" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPromotionRequest" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "promotionType" "PromotionType" NOT NULL,
    "budget" DECIMAL(10,2),
    "note" TEXT,
    "status" "PromotionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPromotionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interfaceLanguage" "AppLanguage" NOT NULL DEFAULT 'EN',
    "theme" "AppTheme" NOT NULL DEFAULT 'SYSTEM',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "courseUpdates" BOOLEAN NOT NULL DEFAULT true,
    "messages" BOOLEAN NOT NULL DEFAULT true,
    "eventReminders" BOOLEAN NOT NULL DEFAULT true,
    "loginAlerts" BOOLEAN NOT NULL DEFAULT true,
    "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showLearningProgress" BOOLEAN NOT NULL DEFAULT true,
    "showCertificates" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PDUTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" "PDUCategory" NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PDUTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PDUActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" "PDUSource" NOT NULL DEFAULT 'OTHER',
    "category" "PDUCategory" NOT NULL,
    "status" "PDUStatus" NOT NULL DEFAULT 'PENDING',
    "pdus" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "creditType" "CreditType" NOT NULL DEFAULT 'PDU',
    "completionStatus" "PDUCompletionStatus" NOT NULL DEFAULT 'COMPLETED',
    "reportingYear" INTEGER,
    "providerOrganizer" TEXT,
    "subCategory" TEXT,
    "issuingOrganization" TEXT,
    "relatedCertification" TEXT,
    "learningOutcome" TEXT,
    "evidenceNote" TEXT,
    "evidenceUrl" TEXT,
    "contentType" "ContentType",
    "contentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PDUActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PDUActivityFile" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PDUActivityFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "certificateUrl" TEXT,
    "verificationCode" TEXT NOT NULL,
    "contentType" "ContentType",
    "contentId" TEXT,
    "pduEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "status" "CertificateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" "ContentType",
    "contentId" TEXT,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "providerPaymentId" TEXT,
    "receiptUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" "CourseCategory",
    "level" "CourseLevel" NOT NULL DEFAULT 'ALL_LEVELS',
    "status" "RoadmapStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapPhase" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapStep" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "contentType" "ContentType",
    "contentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "RoadmapEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "complianceCycle" "ComplianceCycle" NOT NULL DEFAULT 'ANNUAL',
    "minimumPdu" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "strictCompliance" BOOLEAN NOT NULL DEFAULT false,
    "complianceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "assignmentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklySummaryReport" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationDepartment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT,
    "jobRole" TEXT,
    "status" "OrganizationMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedLearning" INTEGER NOT NULL DEFAULT 0,
    "pdus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "compliance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationCPDCategory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "category" "PDUCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requiredHours" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationCPDCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "courseId" TEXT,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "AssignmentType" NOT NULL DEFAULT 'SOFT',
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "targetKind" "AssignmentTargetKind" NOT NULL DEFAULT 'ALL',
    "departmentId" TEXT,
    "targetRole" TEXT,
    "targetMemberId" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationAssignmentRecipient" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationAssignmentRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalLearningActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "eventId" TEXT,
    "provider" "ExternalLearningProvider" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "externalUrl" TEXT NOT NULL,
    "status" "ExternalLearningStatus" NOT NULL DEFAULT 'CLICKED',
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remindedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "pduHours" DOUBLE PRECISION,
    "certificateUrl" TEXT,
    "licenseNumber" TEXT,
    "evidenceNote" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalLearningActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEvent_userId_idx" ON "CalendarEvent"("userId");

-- CreateIndex
CREATE INDEX "CalendarEvent_startDate_idx" ON "CalendarEvent"("startDate");

-- CreateIndex
CREATE INDEX "CalendarEvent_contentType_contentId_idx" ON "CalendarEvent"("contentType", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSettings_providerId_key" ON "ProviderSettings"("providerId");

-- CreateIndex
CREATE INDEX "ProviderSettings_providerId_idx" ON "ProviderSettings"("providerId");

-- CreateIndex
CREATE INDEX "EventPromotionRequest_providerId_idx" ON "EventPromotionRequest"("providerId");

-- CreateIndex
CREATE INDEX "EventPromotionRequest_eventId_idx" ON "EventPromotionRequest"("eventId");

-- CreateIndex
CREATE INDEX "EventPromotionRequest_status_idx" ON "EventPromotionRequest"("status");

-- CreateIndex
CREATE INDEX "EventPromotionRequest_createdAt_idx" ON "EventPromotionRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalSettings_userId_key" ON "ProfessionalSettings"("userId");

-- CreateIndex
CREATE INDEX "ProfessionalSettings_userId_idx" ON "ProfessionalSettings"("userId");

-- CreateIndex
CREATE INDEX "PDUTarget_userId_idx" ON "PDUTarget"("userId");

-- CreateIndex
CREATE INDEX "PDUTarget_year_idx" ON "PDUTarget"("year");

-- CreateIndex
CREATE INDEX "PDUTarget_category_idx" ON "PDUTarget"("category");

-- CreateIndex
CREATE UNIQUE INDEX "PDUTarget_userId_year_category_key" ON "PDUTarget"("userId", "year", "category");

-- CreateIndex
CREATE INDEX "PDUActivity_userId_idx" ON "PDUActivity"("userId");

-- CreateIndex
CREATE INDEX "PDUActivity_category_idx" ON "PDUActivity"("category");

-- CreateIndex
CREATE INDEX "PDUActivity_status_idx" ON "PDUActivity"("status");

-- CreateIndex
CREATE INDEX "PDUActivity_date_idx" ON "PDUActivity"("date");

-- CreateIndex
CREATE INDEX "PDUActivity_reportingYear_idx" ON "PDUActivity"("reportingYear");

-- CreateIndex
CREATE INDEX "PDUActivity_completionStatus_idx" ON "PDUActivity"("completionStatus");

-- CreateIndex
CREATE INDEX "PDUActivity_contentType_contentId_idx" ON "PDUActivity"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "PDUActivityFile_activityId_idx" ON "PDUActivityFile"("activityId");

-- CreateIndex
CREATE INDEX "PDUActivityFile_userId_idx" ON "PDUActivityFile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "Certificate"("verificationCode");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

-- CreateIndex
CREATE INDEX "Certificate_issuedAt_idx" ON "Certificate"("issuedAt");

-- CreateIndex
CREATE INDEX "Certificate_contentType_contentId_idx" ON "Certificate"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- CreateIndex
CREATE INDEX "Payment_contentType_contentId_idx" ON "Payment"("contentType", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_slug_key" ON "Roadmap"("slug");

-- CreateIndex
CREATE INDEX "Roadmap_status_idx" ON "Roadmap"("status");

-- CreateIndex
CREATE INDEX "Roadmap_category_idx" ON "Roadmap"("category");

-- CreateIndex
CREATE INDEX "Roadmap_title_idx" ON "Roadmap"("title");

-- CreateIndex
CREATE INDEX "RoadmapPhase_roadmapId_idx" ON "RoadmapPhase"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapPhase_roadmapId_order_key" ON "RoadmapPhase"("roadmapId", "order");

-- CreateIndex
CREATE INDEX "RoadmapStep_phaseId_idx" ON "RoadmapStep"("phaseId");

-- CreateIndex
CREATE INDEX "RoadmapStep_contentType_contentId_idx" ON "RoadmapStep"("contentType", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapStep_phaseId_order_key" ON "RoadmapStep"("phaseId", "order");

-- CreateIndex
CREATE INDEX "RoadmapEnrollment_userId_idx" ON "RoadmapEnrollment"("userId");

-- CreateIndex
CREATE INDEX "RoadmapEnrollment_roadmapId_idx" ON "RoadmapEnrollment"("roadmapId");

-- CreateIndex
CREATE INDEX "RoadmapEnrollment_status_idx" ON "RoadmapEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapEnrollment_userId_roadmapId_key" ON "RoadmapEnrollment"("userId", "roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_ownerId_key" ON "Organization"("ownerId");

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationDepartment_organizationId_idx" ON "OrganizationDepartment"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationDepartment_organizationId_title_key" ON "OrganizationDepartment"("organizationId", "title");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_departmentId_idx" ON "OrganizationMember"("departmentId");

-- CreateIndex
CREATE INDEX "OrganizationMember_status_idx" ON "OrganizationMember"("status");

-- CreateIndex
CREATE INDEX "OrganizationMember_compliance_idx" ON "OrganizationMember"("compliance");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationCPDCategory_organizationId_idx" ON "OrganizationCPDCategory"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationCPDCategory_category_idx" ON "OrganizationCPDCategory"("category");

-- CreateIndex
CREATE INDEX "OrganizationCPDCategory_isActive_idx" ON "OrganizationCPDCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationCPDCategory_organizationId_category_key" ON "OrganizationCPDCategory"("organizationId", "category");

-- CreateIndex
CREATE INDEX "OrganizationAssignment_organizationId_idx" ON "OrganizationAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationAssignment_courseId_idx" ON "OrganizationAssignment"("courseId");

-- CreateIndex
CREATE INDEX "OrganizationAssignment_eventId_idx" ON "OrganizationAssignment"("eventId");

-- CreateIndex
CREATE INDEX "OrganizationAssignment_status_idx" ON "OrganizationAssignment"("status");

-- CreateIndex
CREATE INDEX "OrganizationAssignment_type_idx" ON "OrganizationAssignment"("type");

-- CreateIndex
CREATE INDEX "OrganizationAssignment_dueDate_idx" ON "OrganizationAssignment"("dueDate");

-- CreateIndex
CREATE INDEX "OrganizationAssignment_createdAt_idx" ON "OrganizationAssignment"("createdAt");

-- CreateIndex
CREATE INDEX "OrganizationAssignmentRecipient_assignmentId_idx" ON "OrganizationAssignmentRecipient"("assignmentId");

-- CreateIndex
CREATE INDEX "OrganizationAssignmentRecipient_memberId_idx" ON "OrganizationAssignmentRecipient"("memberId");

-- CreateIndex
CREATE INDEX "OrganizationAssignmentRecipient_completedAt_idx" ON "OrganizationAssignmentRecipient"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationAssignmentRecipient_assignmentId_memberId_key" ON "OrganizationAssignmentRecipient"("assignmentId", "memberId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ExternalLearningActivity_userId_idx" ON "ExternalLearningActivity"("userId");

-- CreateIndex
CREATE INDEX "ExternalLearningActivity_courseId_idx" ON "ExternalLearningActivity"("courseId");

-- CreateIndex
CREATE INDEX "ExternalLearningActivity_eventId_idx" ON "ExternalLearningActivity"("eventId");

-- CreateIndex
CREATE INDEX "ExternalLearningActivity_status_idx" ON "ExternalLearningActivity"("status");

-- CreateIndex
CREATE INDEX "ExternalLearningActivity_provider_idx" ON "ExternalLearningActivity"("provider");

-- CreateIndex
CREATE INDEX "ExternalLearningActivity_clickedAt_idx" ON "ExternalLearningActivity"("clickedAt");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSettings" ADD CONSTRAINT "ProviderSettings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPromotionRequest" ADD CONSTRAINT "EventPromotionRequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPromotionRequest" ADD CONSTRAINT "EventPromotionRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPromotionRequest" ADD CONSTRAINT "EventPromotionRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalSettings" ADD CONSTRAINT "ProfessionalSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDUTarget" ADD CONSTRAINT "PDUTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDUActivity" ADD CONSTRAINT "PDUActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDUActivityFile" ADD CONSTRAINT "PDUActivityFile_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "PDUActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDUActivityFile" ADD CONSTRAINT "PDUActivityFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapPhase" ADD CONSTRAINT "RoadmapPhase_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapStep" ADD CONSTRAINT "RoadmapStep_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "RoadmapPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapEnrollment" ADD CONSTRAINT "RoadmapEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapEnrollment" ADD CONSTRAINT "RoadmapEnrollment_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationDepartment" ADD CONSTRAINT "OrganizationDepartment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "OrganizationDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCPDCategory" ADD CONSTRAINT "OrganizationCPDCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAssignment" ADD CONSTRAINT "OrganizationAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAssignment" ADD CONSTRAINT "OrganizationAssignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAssignment" ADD CONSTRAINT "OrganizationAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAssignment" ADD CONSTRAINT "OrganizationAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAssignmentRecipient" ADD CONSTRAINT "OrganizationAssignmentRecipient_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "OrganizationAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAssignmentRecipient" ADD CONSTRAINT "OrganizationAssignmentRecipient_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLearningActivity" ADD CONSTRAINT "ExternalLearningActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLearningActivity" ADD CONSTRAINT "ExternalLearningActivity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLearningActivity" ADD CONSTRAINT "ExternalLearningActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

END IF;
END
$historical_baseline$;
