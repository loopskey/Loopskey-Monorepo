-- CreateTable
CREATE TABLE "CourseTranslation" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "learnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTranslation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PodcastTranslation" (
    "id" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcastTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeChannelTranslation" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "locale" "AppLanguage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeChannelTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseTranslation_locale_isPublished_idx" ON "CourseTranslation"("locale", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "CourseTranslation_courseId_locale_key" ON "CourseTranslation"("courseId", "locale");

-- CreateIndex
CREATE INDEX "EventTranslation_locale_isPublished_idx" ON "EventTranslation"("locale", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "EventTranslation_eventId_locale_key" ON "EventTranslation"("eventId", "locale");

-- CreateIndex
CREATE INDEX "PodcastTranslation_locale_isPublished_idx" ON "PodcastTranslation"("locale", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastTranslation_podcastId_locale_key" ON "PodcastTranslation"("podcastId", "locale");

-- CreateIndex
CREATE INDEX "YouTubeChannelTranslation_locale_isPublished_idx" ON "YouTubeChannelTranslation"("locale", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeChannelTranslation_channelId_locale_key" ON "YouTubeChannelTranslation"("channelId", "locale");

-- AddForeignKey
ALTER TABLE "CourseTranslation" ADD CONSTRAINT "CourseTranslation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTranslation" ADD CONSTRAINT "EventTranslation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastTranslation" ADD CONSTRAINT "PodcastTranslation_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeChannelTranslation" ADD CONSTRAINT "YouTubeChannelTranslation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "YouTubeChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "CourseTranslation" ADD CONSTRAINT "CourseTranslation_published_complete_check" CHECK (NOT "isPublished" OR (btrim("title") <> '' AND btrim("description") <> ''));

-- AddCheckConstraint
ALTER TABLE "EventTranslation" ADD CONSTRAINT "EventTranslation_published_complete_check" CHECK (NOT "isPublished" OR (btrim("title") <> '' AND btrim("description") <> ''));

-- AddCheckConstraint
ALTER TABLE "PodcastTranslation" ADD CONSTRAINT "PodcastTranslation_published_complete_check" CHECK (NOT "isPublished" OR (btrim("title") <> '' AND btrim("description") <> ''));

-- AddCheckConstraint
ALTER TABLE "YouTubeChannelTranslation" ADD CONSTRAINT "YouTubeChannelTranslation_published_complete_check" CHECK (NOT "isPublished" OR (btrim("title") <> '' AND btrim("description") <> ''));
