import { NestFactory } from "@nestjs/core";
import { IngestionContentKind } from "@prisma/client";

import { AppModule } from "@app/app.module";
import { EVENT_CANONICAL_FIELDS } from "@ingestion/enums/event-ingestion.constant";
import { PODCAST_CANONICAL_FIELDS } from "@ingestion/enums/podcast-ingestion.constant";
import { YOUTUBE_CANONICAL_FIELDS } from "@ingestion/enums/youtube-ingestion.constant";
import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import { validateCanonicalFieldMap } from "@ingestion/utils/canonical-field-map.util";
import { validateCourseFieldMap } from "@ingestion/utils/course-field-map.util";
import { PrismaService } from "@prisma/prisma.service";

const COURSE_FIELD_MAP = {
  externalCourseId: "externalId",
  sourceUrl: "canonicalUrl",
  sourcePlatform: "sourcePlatform",
  title: "title",
  description: "description",
  instructor: "instructor",
  imageUrl: "imageCandidateUrl",
  category: "category",
  level: "level",
  requirements: "requirements",
  learnings: "learnings",
  price: "price",
  currency: "currency",
  isFree: "isFree",
  durationMinutes: "durationMinutes",
  lastUpdatedAt: "lastUpdatedAt",
  rawCategory: "rawCategory",
  rawLevel: "rawLevel",
  rawDuration: "rawDuration",
  language: "language",
  internalCategory: "internalCategory",
  offersCertificate: "offersCertificate",
  creditValue: "creditValue",
  creditSource: "creditSource",
  creditConfidence: "creditConfidence",
  crawledAt: "crawledAt",
  updatedAt: "updatedAt",
};

const EVENT_FIELD_MAP = {
  externalCourseId: "externalId",
  sourceUrl: "canonicalUrl",
  sourcePlatform: "sourcePlatform",
  title: "title",
  description: "description",
  instructor: "speaker",
  organizer: "organizer",
  imageUrl: "imageCandidateUrl",
  type: "type",
  deliveryMode: "deliveryMode",
  category: "category",
  startDate: "startDate",
  endDate: "endDate",
  timezone: "timezone",
  location: "location",
  onlineUrl: "onlineUrl",
  price: "price",
  currency: "currency",
  isFree: "isFree",
  language: "language",
  rawType: "rawType",
  rawDeliveryMode: "rawDeliveryMode",
  rawCategory: "rawCategory",
  scheduleItems: "scheduleItems",
  lastUpdatedAt: "lastUpdatedAt",
  crawledAt: "crawledAt",
  updatedAt: "updatedAt",
};

const PODCAST_FIELD_MAP = {
  showId: "externalId",
  showUrl: "canonicalUrl",
  sourcePlatform: "sourcePlatform",
  showTitle: "title",
  showDescription: "description",
  host: "host",
  imageUrl: "imageCandidateUrl",
  category: "category",
  durationMinutes: "durationMinutes",
  language: "language",
  rawCategory: "rawCategory",
  episodes: "episodes",
  lastUpdatedAt: "lastUpdatedAt",
  crawledAt: "crawledAt",
  updatedAt: "updatedAt",
};

const YOUTUBE_FIELD_MAP = {
  channelId: "externalId",
  channelPageUrl: "canonicalUrl",
  sourcePlatform: "sourcePlatform",
  channelTitle: "title",
  channelDescription: "description",
  imageUrl: "imageCandidateUrl",
  channelUrl: "channelUrl",
  category: "category",
  subscribers: "subscribers",
  views: "views",
  videoCount: "videoCount",
  language: "language",
  rawCategory: "rawCategory",
  videos: "videos",
  lastUpdatedAt: "lastUpdatedAt",
  crawledAt: "crawledAt",
  updatedAt: "updatedAt",
};

const CRAWLER_SOURCES: Array<{
  slug: string;
  name: string;
  kind: IngestionContentKind;
  fieldMap: Record<string, string>;
}> = [
  {
    slug: "crawler-course",
    name: "Crawler — courses",
    kind: IngestionContentKind.COURSE,
    fieldMap: COURSE_FIELD_MAP,
  },
  {
    slug: "crawler-event",
    name: "Crawler — events",
    kind: IngestionContentKind.EVENT,
    fieldMap: EVENT_FIELD_MAP,
  },
  {
    slug: "crawler-podcast",
    name: "Crawler — podcasts",
    kind: IngestionContentKind.PODCAST,
    fieldMap: PODCAST_FIELD_MAP,
  },
  {
    slug: "crawler-youtube",
    name: "Crawler — YouTube channels",
    kind: IngestionContentKind.YOUTUBE,
    fieldMap: YOUTUBE_FIELD_MAP,
  },
];

const ACTOR = "script:create-crawler-sources";

export const validateEveryFieldMapBeforeWriting = () => {
  validateCourseFieldMap(COURSE_FIELD_MAP);
  validateCanonicalFieldMap(EVENT_FIELD_MAP, EVENT_CANONICAL_FIELDS, "event");
  validateCanonicalFieldMap(
    PODCAST_FIELD_MAP,
    PODCAST_CANONICAL_FIELDS,
    "podcast",
  );
  validateCanonicalFieldMap(
    YOUTUBE_FIELD_MAP,
    YOUTUBE_CANONICAL_FIELDS,
    "youtube",
  );
};

const main = async () => {
  validateEveryFieldMapBeforeWriting();
  const shouldIssueKey = process.argv.includes("--issue-key");

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn"],
  });
  const admin = app.get(IngestionAdminService, { strict: false });
  const prisma = app.get(PrismaService, { strict: false });

  const issued: Array<{ slug: string; credential: string }> = [];

  for (const spec of CRAWLER_SOURCES) {
    const existing = await prisma.ingestionSource.findUnique({
      where: { slug: spec.slug },
    });
    const source = existing
      ? await admin.updateSource(ACTOR, {
          sourceId: existing.id,
          fieldMap: spec.fieldMap,
        })
      : await admin.createSource(ACTOR, {
          slug: spec.slug,
          name: spec.name,
          kind: spec.kind,
          autoPublish: false,
          fieldMap: spec.fieldMap,
        });
    console.log(
      existing
        ? `${spec.slug}: field map refreshed (${source.id})`
        : `${spec.slug}: created (${source.id})`,
    );

    if (shouldIssueKey) {
      const key = await admin.issueKey(ACTOR, {
        sourceId: source.id,
        name: `crawler key ${new Date().toISOString().slice(0, 10)}`,
      });
      issued.push({ slug: spec.slug, credential: key.credential });
    }
  }

  if (!shouldIssueKey)
    console.log("\nNo key issued. Re-run with --issue-key when you need one.\n");
  else {
    console.log("\nCredentials (shown once — copy them now):\n");
    for (const row of issued)
      console.log(`  ${row.slug.padEnd(18)} ${row.credential}`);
    console.log("\nBase URL: <this environment's API origin> + /v1/ingest\n");
  }

  await app.close();
};

if (require.main === module)
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
