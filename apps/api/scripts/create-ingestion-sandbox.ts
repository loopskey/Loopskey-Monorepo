/**
 * Creates the four permanent ingestion sandbox sources a crawler team develops
 * against — one per content kind, all with automatic publication OFF — and
 * prints one freshly issued API key for each.
 *
 * This is a one-shot operator tool, run by hand per environment. It is
 * deliberately NOT a Prisma seed and NOT wired into any deploy step: the
 * ingestion spec (phase 07) requires the sandbox sources to be created through
 * the phase 04 admin operations rather than by a migration or a seed that would
 * run in production. It goes through `IngestionAdminService` for exactly that
 * reason.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register apps/api/scripts/create-ingestion-sandbox.ts
 *
 * Idempotent: a source that already exists keeps its id and has its identity
 * field map re-applied; a fresh key is always issued (old keys are untouched —
 * revoke them from the console if you want the previous one gone).
 */
import { NestFactory } from "@nestjs/core";
import { IngestionContentKind } from "@prisma/client";

import { AppModule } from "@app/app.module";
import { COURSE_CANONICAL_FIELDS } from "@ingestion/enums/course-ingestion.constant";
import { EVENT_CANONICAL_FIELDS } from "@ingestion/enums/event-ingestion.constant";
import { PODCAST_CANONICAL_FIELDS } from "@ingestion/enums/podcast-ingestion.constant";
import { YOUTUBE_CANONICAL_FIELDS } from "@ingestion/enums/youtube-ingestion.constant";
import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import { PrismaService } from "@prisma/prisma.service";

/**
 * An identity field map: the source of truth for a sandbox is that the crawler
 * sends the platform's own canonical field names, so the guide's examples work
 * verbatim. A real production source gets a map that renames the crawler's own
 * column names onto these instead.
 */
const identityFieldMap = (fields: readonly string[]) =>
  Object.fromEntries(fields.map((field) => [field, field]));

const SANDBOX_SOURCES: Array<{
  slug: string;
  name: string;
  kind: IngestionContentKind;
  fieldMap: Record<string, string>;
}> = [
  {
    slug: "sandbox-course",
    name: "Sandbox — courses",
    kind: IngestionContentKind.COURSE,
    fieldMap: identityFieldMap(COURSE_CANONICAL_FIELDS),
  },
  {
    slug: "sandbox-event",
    name: "Sandbox — events",
    kind: IngestionContentKind.EVENT,
    fieldMap: identityFieldMap(EVENT_CANONICAL_FIELDS),
  },
  {
    slug: "sandbox-podcast",
    name: "Sandbox — podcasts",
    kind: IngestionContentKind.PODCAST,
    fieldMap: identityFieldMap(PODCAST_CANONICAL_FIELDS),
  },
  {
    slug: "sandbox-youtube",
    name: "Sandbox — YouTube channels",
    kind: IngestionContentKind.YOUTUBE,
    fieldMap: identityFieldMap(YOUTUBE_CANONICAL_FIELDS),
  },
];

const ACTOR = "script:create-ingestion-sandbox";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn"],
  });
  const admin = app.get(IngestionAdminService, { strict: false });
  const prisma = app.get(PrismaService, { strict: false });

  const issued: Array<{ slug: string; credential: string }> = [];

  for (const spec of SANDBOX_SOURCES) {
    let source = await prisma.ingestionSource.findUnique({
      where: { slug: spec.slug },
    });
    if (!source) {
      source = await admin.createSource(ACTOR, {
        slug: spec.slug,
        name: spec.name,
        kind: spec.kind,
        autoPublish: false,
        fieldMap: spec.fieldMap,
      });
      console.log(`created source ${spec.slug} (${source.id})`);
    } else {
      source = await admin.updateSource(ACTOR, {
        sourceId: source.id,
        fieldMap: spec.fieldMap,
      });
      console.log(
        `source ${spec.slug} already exists (${source.id}); field map refreshed`,
      );
    }

    const key = await admin.issueKey(ACTOR, {
      sourceId: source.id,
      name: `sandbox key ${new Date().toISOString().slice(0, 10)}`,
    });
    issued.push({ slug: spec.slug, credential: key.credential });
  }

  console.log("\nSandbox credentials (shown once — copy them now):\n");
  for (const row of issued) {
    console.log(`  ${row.slug.padEnd(16)} ${row.credential}`);
  }
  console.log(
    "\nBase URL for the crawler team: <this environment's API origin> + /v1/ingest\n",
  );

  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
