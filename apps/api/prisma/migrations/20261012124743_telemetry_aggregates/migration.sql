-- CreateEnum
CREATE TYPE "TelemetryMetric" AS ENUM ('LCP', 'INP', 'CLS');

-- CreateEnum
CREATE TYPE "TelemetryDevice" AS ENUM ('MOBILE', 'DESKTOP');

-- CreateEnum
CREATE TYPE "TelemetryRouteTemplate" AS ENUM ('HOME', 'CONTENT_CATALOG', 'COURSE_DETAIL', 'EVENT_DETAIL', 'PODCAST_DETAIL', 'YOUTUBE_DETAIL', 'TOPIC_HUB', 'PROVIDER_PROFILE', 'ABOUT', 'CONTACT', 'FAQ', 'SERVICES', 'SOLUTIONS', 'COMPANY', 'SUPPORT', 'LEGAL');

-- CreateEnum
CREATE TYPE "TelemetryLocale" AS ENUM ('EN', 'FR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TelemetryConversionEvent" AS ENUM ('CATALOG_DETAIL_OPEN', 'EXTERNAL_CONTENT_ACTION', 'REGISTRATION_START', 'REGISTRATION_COMPLETED');

-- CreateEnum
CREATE TYPE "TelemetryContentKind" AS ENUM ('NONE', 'COURSE', 'EVENT', 'PODCAST', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "TelemetryRegistrationRole" AS ENUM ('NONE', 'PROFESSIONAL', 'PROVIDER');

-- CreateEnum
CREATE TYPE "TelemetryAttribution" AS ENUM ('DIRECT', 'ORGANIC_SEARCH', 'SOCIAL', 'REFERRAL', 'INTERNAL', 'UNATTRIBUTED');

-- CreateEnum
CREATE TYPE "TelemetryIntakeKind" AS ENUM ('VITAL', 'CONVERSION');

-- CreateEnum
CREATE TYPE "TelemetryIntakeOutcome" AS ENUM ('ACCEPTED', 'DUPLICATE', 'INVALID', 'RATE_LIMITED', 'SAMPLED_OUT', 'DISABLED', 'SINK_FAILED');

-- CreateTable
CREATE TABLE "TelemetryVitalBucket" (
    "day" DATE NOT NULL,
    "metric" "TelemetryMetric" NOT NULL,
    "device" "TelemetryDevice" NOT NULL,
    "template" "TelemetryRouteTemplate" NOT NULL,
    "locale" "TelemetryLocale" NOT NULL,
    "bucket" SMALLINT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "TelemetryVitalBucket_pkey" PRIMARY KEY ("day","metric","device","template","locale","bucket")
);

-- CreateTable
CREATE TABLE "TelemetryConversionDaily" (
    "day" DATE NOT NULL,
    "event" "TelemetryConversionEvent" NOT NULL,
    "contentKind" "TelemetryContentKind" NOT NULL,
    "role" "TelemetryRegistrationRole" NOT NULL,
    "attribution" "TelemetryAttribution" NOT NULL,
    "locale" "TelemetryLocale" NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "TelemetryConversionDaily_pkey" PRIMARY KEY ("day","event","contentKind","role","attribution","locale")
);

-- CreateTable
CREATE TABLE "TelemetryIntakeDaily" (
    "day" DATE NOT NULL,
    "kind" "TelemetryIntakeKind" NOT NULL,
    "outcome" "TelemetryIntakeOutcome" NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "TelemetryIntakeDaily_pkey" PRIMARY KEY ("day","kind","outcome")
);

-- CreateTable
CREATE TABLE "TelemetryDedupKey" (
    "key" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryDedupKey_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "TelemetryDedupKey_seenAt_idx" ON "TelemetryDedupKey"("seenAt");

ALTER TABLE "TelemetryVitalBucket"
  ADD CONSTRAINT "TelemetryVitalBucket_count_check" CHECK ("count" > 0 AND "bucket" >= 0);

ALTER TABLE "TelemetryConversionDaily"
  ADD CONSTRAINT "TelemetryConversionDaily_count_check" CHECK ("count" > 0);

ALTER TABLE "TelemetryIntakeDaily"
  ADD CONSTRAINT "TelemetryIntakeDaily_count_check" CHECK ("count" > 0);
