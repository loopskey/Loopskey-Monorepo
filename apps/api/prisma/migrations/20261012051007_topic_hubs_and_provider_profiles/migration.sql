-- CreateEnum
CREATE TYPE "TopicHubStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ProviderProfileStatus" AS ENUM ('UNPUBLISHED', 'PUBLISHED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ProviderProfileReviewState" AS ENUM ('DRAFT', 'SUBMITTED', 'REJECTED', 'APPROVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "AuditAction" ADD VALUE 'TOPIC_HUB_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'TOPIC_HUB_STATUS_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'TOPIC_HUB_INDEX_EXCLUSION_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'PROVIDER_PROFILE_SUBMITTED';
ALTER TYPE "AuditAction" ADD VALUE 'PROVIDER_PROFILE_REVIEWED';
ALTER TYPE "AuditAction" ADD VALUE 'PROVIDER_PROFILE_WITHDRAWN';
ALTER TYPE "AuditAction" ADD VALUE 'PROVIDER_PROFILE_INDEX_EXCLUSION_CHANGED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "ContentUrlNamespace" ADD VALUE 'TOPIC';
ALTER TYPE "ContentUrlNamespace" ADD VALUE 'PROVIDER';

-- CreateTable
CREATE TABLE "TopicHub" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TopicHubStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "category" TEXT,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'en',
    "version" INTEGER NOT NULL DEFAULT 1,
    "excludeFromIndex" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "publicContentUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicHub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicHubTranslation" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "title" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicHubTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicHubReference" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "kind" "ContentUrlNamespace" NOT NULL,
    "targetId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicHubReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPublicProfile" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ProviderProfileStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "displayName" TEXT,
    "biography" TEXT,
    "websiteUrl" TEXT,
    "links" JSONB NOT NULL DEFAULT '[]',
    "logoImageId" TEXT,
    "draftVersion" INTEGER NOT NULL DEFAULT 1,
    "reviewState" "ProviderProfileReviewState" NOT NULL DEFAULT 'DRAFT',
    "submittedVersion" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "publishedRevision" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "sourceLanguage" TEXT NOT NULL DEFAULT 'en',
    "excludeFromIndex" BOOLEAN NOT NULL DEFAULT false,
    "publicContentUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderPublicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPublicRevision" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "links" JSONB NOT NULL DEFAULT '[]',
    "logoImageId" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderPublicRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicHub_slug_key" ON "TopicHub"("slug");

-- CreateIndex
CREATE INDEX "TopicHub_status_publishedAt_idx" ON "TopicHub"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TopicHubTranslation_hubId_locale_key" ON "TopicHubTranslation"("hubId", "locale");

-- CreateIndex
CREATE INDEX "TopicHubReference_hubId_position_idx" ON "TopicHubReference"("hubId", "position");

-- CreateIndex
CREATE INDEX "TopicHubReference_kind_targetId_idx" ON "TopicHubReference"("kind", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicHubReference_hubId_kind_targetId_key" ON "TopicHubReference"("hubId", "kind", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderPublicProfile_providerId_key" ON "ProviderPublicProfile"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderPublicProfile_slug_key" ON "ProviderPublicProfile"("slug");

-- CreateIndex
CREATE INDEX "ProviderPublicProfile_reviewState_submittedAt_idx" ON "ProviderPublicProfile"("reviewState", "submittedAt");

-- CreateIndex
CREATE INDEX "ProviderPublicProfile_logoImageId_idx" ON "ProviderPublicProfile"("logoImageId");

-- CreateIndex
CREATE INDEX "ProviderPublicRevision_logoImageId_idx" ON "ProviderPublicRevision"("logoImageId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderPublicRevision_profileId_revision_key" ON "ProviderPublicRevision"("profileId", "revision");

-- AddForeignKey
ALTER TABLE "TopicHubTranslation" ADD CONSTRAINT "TopicHubTranslation_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "TopicHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicHubReference" ADD CONSTRAINT "TopicHubReference_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "TopicHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPublicProfile" ADD CONSTRAINT "ProviderPublicProfile_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPublicProfile" ADD CONSTRAINT "ProviderPublicProfile_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "ContentSocialImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPublicRevision" ADD CONSTRAINT "ProviderPublicRevision_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProviderPublicProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPublicRevision" ADD CONSTRAINT "ProviderPublicRevision_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "ContentSocialImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Unmanaged: a published hub has a publication time, and a live provider profile has an approved revision.
ALTER TABLE "TopicHub"
  ADD CONSTRAINT "TopicHub_published_check"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "ProviderPublicProfile"
  ADD CONSTRAINT "ProviderPublicProfile_published_check"
  CHECK ("status" <> 'PUBLISHED' OR "publishedRevision" IS NOT NULL);

-- Hub and provider slugs are claimed through the same registry as catalog slugs.
CREATE TRIGGER "TopicHub_content_url_claim"
  AFTER INSERT OR UPDATE OF "slug" ON "TopicHub"
  FOR EACH ROW EXECUTE FUNCTION "content_url_claim_sync"('TOPIC', 'TopicHub_slug_key');

CREATE TRIGGER "ProviderPublicProfile_content_url_claim"
  AFTER INSERT OR UPDATE OF "slug" ON "ProviderPublicProfile"
  FOR EACH ROW EXECUTE FUNCTION "content_url_claim_sync"('PROVIDER', 'ProviderPublicProfile_slug_key');
