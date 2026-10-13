-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'CONTENT_SEO_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'CONTENT_INDEX_EXCLUSION_CHANGED';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "excludeFromIndex" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "excludeFromIndex" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "excludeFromIndex" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "YouTubeChannel" ADD COLUMN     "excludeFromIndex" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CourseSeo" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "socialImageAlt" TEXT,
    "socialImageId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSeo" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "socialImageAlt" TEXT,
    "socialImageId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PodcastSeo" (
    "id" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "socialImageAlt" TEXT,
    "socialImageId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcastSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeChannelSeo" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "socialImageAlt" TEXT,
    "socialImageId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeChannelSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSocialImage" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSocialImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseSeo_socialImageId_idx" ON "CourseSeo"("socialImageId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSeo_courseId_locale_key" ON "CourseSeo"("courseId", "locale");

-- CreateIndex
CREATE INDEX "EventSeo_socialImageId_idx" ON "EventSeo"("socialImageId");

-- CreateIndex
CREATE UNIQUE INDEX "EventSeo_eventId_locale_key" ON "EventSeo"("eventId", "locale");

-- CreateIndex
CREATE INDEX "PodcastSeo_socialImageId_idx" ON "PodcastSeo"("socialImageId");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastSeo_podcastId_locale_key" ON "PodcastSeo"("podcastId", "locale");

-- CreateIndex
CREATE INDEX "YouTubeChannelSeo_socialImageId_idx" ON "YouTubeChannelSeo"("socialImageId");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeChannelSeo_channelId_locale_key" ON "YouTubeChannelSeo"("channelId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSocialImage_storageKey_key" ON "ContentSocialImage"("storageKey");

-- CreateIndex
CREATE INDEX "ContentSocialImage_ownerId_createdAt_idx" ON "ContentSocialImage"("ownerId", "createdAt");

-- AddForeignKey
ALTER TABLE "CourseSeo" ADD CONSTRAINT "CourseSeo_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSeo" ADD CONSTRAINT "CourseSeo_socialImageId_fkey" FOREIGN KEY ("socialImageId") REFERENCES "ContentSocialImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSeo" ADD CONSTRAINT "EventSeo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSeo" ADD CONSTRAINT "EventSeo_socialImageId_fkey" FOREIGN KEY ("socialImageId") REFERENCES "ContentSocialImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastSeo" ADD CONSTRAINT "PodcastSeo_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastSeo" ADD CONSTRAINT "PodcastSeo_socialImageId_fkey" FOREIGN KEY ("socialImageId") REFERENCES "ContentSocialImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeChannelSeo" ADD CONSTRAINT "YouTubeChannelSeo_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "YouTubeChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeChannelSeo" ADD CONSTRAINT "YouTubeChannelSeo_socialImageId_fkey" FOREIGN KEY ("socialImageId") REFERENCES "ContentSocialImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Unmanaged by Prisma: bounds and blank refusal for editor-owned SEO text.
ALTER TABLE "CourseSeo" ADD CONSTRAINT "courseseo_seo_bounds_check" CHECK (
    ("seoTitle" IS NULL OR (char_length(btrim("seoTitle")) BETWEEN 1 AND 200))
    AND ("seoDescription" IS NULL OR (char_length(btrim("seoDescription")) BETWEEN 1 AND 500))
    AND ("socialImageAlt" IS NULL OR (char_length(btrim("socialImageAlt")) BETWEEN 1 AND 300))
    AND ("socialImageAlt" IS NULL OR "socialImageId" IS NOT NULL)
);

-- Unmanaged by Prisma: bounds and blank refusal for editor-owned SEO text.
ALTER TABLE "EventSeo" ADD CONSTRAINT "eventseo_seo_bounds_check" CHECK (
    ("seoTitle" IS NULL OR (char_length(btrim("seoTitle")) BETWEEN 1 AND 200))
    AND ("seoDescription" IS NULL OR (char_length(btrim("seoDescription")) BETWEEN 1 AND 500))
    AND ("socialImageAlt" IS NULL OR (char_length(btrim("socialImageAlt")) BETWEEN 1 AND 300))
    AND ("socialImageAlt" IS NULL OR "socialImageId" IS NOT NULL)
);

-- Unmanaged by Prisma: bounds and blank refusal for editor-owned SEO text.
ALTER TABLE "PodcastSeo" ADD CONSTRAINT "podcastseo_seo_bounds_check" CHECK (
    ("seoTitle" IS NULL OR (char_length(btrim("seoTitle")) BETWEEN 1 AND 200))
    AND ("seoDescription" IS NULL OR (char_length(btrim("seoDescription")) BETWEEN 1 AND 500))
    AND ("socialImageAlt" IS NULL OR (char_length(btrim("socialImageAlt")) BETWEEN 1 AND 300))
    AND ("socialImageAlt" IS NULL OR "socialImageId" IS NOT NULL)
);

-- Unmanaged by Prisma: bounds and blank refusal for editor-owned SEO text.
ALTER TABLE "YouTubeChannelSeo" ADD CONSTRAINT "youtubechannelseo_seo_bounds_check" CHECK (
    ("seoTitle" IS NULL OR (char_length(btrim("seoTitle")) BETWEEN 1 AND 200))
    AND ("seoDescription" IS NULL OR (char_length(btrim("seoDescription")) BETWEEN 1 AND 500))
    AND ("socialImageAlt" IS NULL OR (char_length(btrim("socialImageAlt")) BETWEEN 1 AND 300))
    AND ("socialImageAlt" IS NULL OR "socialImageId" IS NOT NULL)
);
