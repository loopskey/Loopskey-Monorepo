import { IngestionContentKind, PrismaClient } from "@prisma/client";
import { assessPublicationQuality } from "@ingestion/utils/publication-quality.util";
import { holdsPublication } from "@ingestion/utils/publication-quality.util";
import { writeFileSync } from "node:fs";

const KNOWN_PROBE_SLUGS = [
  "crawler-ingest-4c8b043ae6d9cee62fc4edd8",
  "crawler-ingest-616e0bc13633115ede949ec5",
];
const DEFAULT_SCAN_LIMIT = 500;
const MAX_SCAN_LIMIT = 5000;
const TITLE_PREVIEW_LENGTH = 80;
const USAGE = `Read-only publication quality inventory. It never writes.

  npx ts-node -r tsconfig-paths/register scripts/publication-quality-inventory.ts [options]

  --slug <slug>      An exact public slug to resolve. Repeatable. Defaults to the two known probes.
  --scan             Also scan published ingested rows for records the publication checks would hold.
  --limit <n>        Rows per kind for --scan (default ${DEFAULT_SCAN_LIMIT}, at most ${MAX_SCAN_LIMIT}).
  --cursor <id>      Resume --scan after this catalogue id.
  --out <path>       Also write the JSON plan to a file.
`;

type CatalogRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  sourceUrl: string | null;
  description: string | null;
  externalRef: string | null;
};

const CATALOG_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  sourceUrl: true,
  externalRef: true,
  status: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const parseArgs = (argv: string[]) => {
  const slugs: string[] = [];
  let scan = false;
  let limit = DEFAULT_SCAN_LIMIT;
  let cursor: string | null = null;
  let out: string | null = null;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--"))
        throw new Error(`${token} needs a value`);
      index += 1;
      return next;
    };
    if (token === "--slug") slugs.push(value());
    else if (token === "--scan") scan = true;
    else if (token === "--limit") limit = Number.parseInt(value(), 10);
    else if (token === "--cursor") cursor = value();
    else if (token === "--out") out = value();
    else if (token === "--help") {
      process.stdout.write(USAGE);
      process.exit(0);
    } else throw new Error(`Unexpected argument ${token}`);
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_SCAN_LIMIT)
    throw new Error(`--limit must be between 1 and ${MAX_SCAN_LIMIT}`);
  return {
    slugs: slugs.length ? slugs : KNOWN_PROBE_SLUGS,
    scan,
    limit,
    cursor,
    out,
  };
};

const catalogs = (prisma: PrismaClient) => ({
  [IngestionContentKind.COURSE]: {
    bySlug: (slug: string) =>
      prisma.course.findUnique({ where: { slug }, select: CATALOG_SELECT }),
    published: (take: number, cursor: string | null) =>
      prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          externalRef: { not: null },
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        orderBy: { id: "asc" },
        take,
        select: CATALOG_SELECT,
      }),
  },
  [IngestionContentKind.EVENT]: {
    bySlug: (slug: string) =>
      prisma.event.findUnique({ where: { slug }, select: CATALOG_SELECT }),
    published: (take: number, cursor: string | null) =>
      prisma.event.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          externalRef: { not: null },
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        orderBy: { id: "asc" },
        take,
        select: CATALOG_SELECT,
      }),
  },
  [IngestionContentKind.PODCAST]: {
    bySlug: (slug: string) =>
      prisma.podcast.findUnique({ where: { slug }, select: CATALOG_SELECT }),
    published: (take: number, cursor: string | null) =>
      prisma.podcast.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          externalRef: { not: null },
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        orderBy: { id: "asc" },
        take,
        select: CATALOG_SELECT,
      }),
  },
  [IngestionContentKind.YOUTUBE]: {
    bySlug: (slug: string) =>
      prisma.youTubeChannel.findUnique({
        where: { slug },
        select: CATALOG_SELECT,
      }),
    published: (take: number, cursor: string | null) =>
      prisma.youTubeChannel.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          externalRef: { not: null },
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        orderBy: { id: "asc" },
        take,
        select: CATALOG_SELECT,
      }),
  },
});

const provenanceOf = async (prisma: PrismaClient, catalogId: string) => {
  const item = await prisma.ingestionItem.findFirst({
    where: { catalogId },
    select: {
      id: true,
      externalId: true,
      state: true,
      reviewedById: true,
      reviewedAt: true,
      reviewReasons: true,
      rejectionReason: true,
      firstSeenAt: true,
      lastSeenAt: true,
      updatedAt: true,
      source: {
        select: { id: true, slug: true, autoPublish: true, isActive: true },
      },
      batch: {
        select: { id: true, createdAt: true, mode: true, correlationId: true },
      },
    },
  });
  if (!item) return null;
  const reviews = await prisma.auditLog.findMany({
    where: { entityType: "IngestionItem", entityId: item.id },
    orderBy: { createdAt: "asc" },
    select: { action: true, actorId: true, createdAt: true },
  });
  return { ...item, reviews };
};

type Provenance = Awaited<ReturnType<typeof provenanceOf>>;

const traceOf = (row: CatalogRow, provenance: Provenance) => {
  if (!provenance)
    return row.externalRef
      ? `Catalogue row carries externalRef ${row.externalRef} but no ingestion item: created outside the ingestion pipeline or its item was removed.`
      : "Not ingested: created through a provider or admin editor, not the crawler.";
  const source = `source ${provenance.source.slug} (autoPublish is now ${provenance.source.autoPublish})`;
  if (provenance.state === "ACCEPTED" && !provenance.reviewedById)
    return `Published by ingestion without a reviewer: ${source}, batch ${provenance.batch?.id ?? "unknown"} at ${provenance.batch?.createdAt.toISOString() ?? "unknown"}.`;
  if (provenance.state === "ACCEPTED")
    return `Published by reviewer ${provenance.reviewedById} at ${provenance.reviewedAt?.toISOString()} from ${source}.`;
  return `Ingestion item is ${provenance.state} from ${source}; the catalogue row is ${row.status}.`;
};

const proposalOf = (
  kind: IngestionContentKind,
  row: CatalogRow,
  provenance: Provenance,
) => {
  if (row.status !== "PUBLISHED" || row.deletedAt)
    return { action: "NONE", reason: "Not publicly listed." };
  if (provenance)
    return {
      action: "REJECT_INGESTION_ITEM",
      control:
        "Admin dashboard > Ingestion > Review queue: state ACCEPTED, search the title, Reject with a reason (mutation rejectIngestionItem).",
      itemId: provenance.id,
      expectedItemState: provenance.state,
      expectedItemUpdatedAt: provenance.updatedAt.toISOString(),
      expectedCatalogUpdatedAt: row.updatedAt.toISOString(),
    };
  return {
    action: kind === IngestionContentKind.COURSE ? "ARCHIVE_COURSE" : "REVIEW",
    control:
      kind === IngestionContentKind.COURSE
        ? "Mutation archiveCourse(courseId) as an administrator."
        : "No ingestion item: review the owning editor before acting.",
    catalogId: row.id,
    expectedCatalogUpdatedAt: row.updatedAt.toISOString(),
  };
};

const describe = async (
  prisma: PrismaClient,
  kind: IngestionContentKind,
  row: CatalogRow,
) => {
  const provenance = await provenanceOf(prisma, row.id);
  return {
    kind,
    catalogId: row.id,
    slug: row.slug,
    status: row.status,
    deleted: Boolean(row.deletedAt),
    titlePreview: row.title.slice(0, TITLE_PREVIEW_LENGTH),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    externalRef: row.externalRef,
    reasons: assessPublicationQuality({
      title: row.title,
      description: row.description,
      urls: [row.sourceUrl],
    }),
    ingestion: provenance
      ? {
          itemId: provenance.id,
          externalId: provenance.externalId,
          state: provenance.state,
          reviewedById: provenance.reviewedById,
          reviewedAt: provenance.reviewedAt?.toISOString() ?? null,
          storedReviewReasons: provenance.reviewReasons,
          firstSeenAt: provenance.firstSeenAt.toISOString(),
          lastSeenAt: provenance.lastSeenAt.toISOString(),
          source: provenance.source,
          batch: provenance.batch
            ? {
                id: provenance.batch.id,
                createdAt: provenance.batch.createdAt.toISOString(),
                mode: provenance.batch.mode,
                correlationId: provenance.batch.correlationId,
              }
            : null,
          reviews: provenance.reviews.map((review) => ({
            action: review.action,
            actorId: review.actorId,
            at: review.createdAt.toISOString(),
          })),
        }
      : null,
    trace: traceOf(row, provenance),
    proposal: proposalOf(kind, row, provenance),
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();
  try {
    const sources = catalogs(prisma);
    const kinds = Object.keys(sources) as IngestionContentKind[];

    const targets = [];
    for (const slug of args.slugs) {
      const found = [];
      for (const kind of kinds) {
        const row = await sources[kind].bySlug(slug);
        if (row) found.push(await describe(prisma, kind, row));
      }
      targets.push({ slug, matches: found.length, records: found });
    }

    const scan = [];
    const nextCursors: Record<string, string | null> = {};
    if (args.scan)
      for (const kind of kinds) {
        const rows = await sources[kind].published(args.limit, args.cursor);
        nextCursors[kind] =
          rows.length === args.limit ? (rows.at(-1)?.id ?? null) : null;
        for (const row of rows) {
          const reasons = assessPublicationQuality({
            title: row.title,
            description: row.description,
            urls: [row.sourceUrl],
          });
          if (holdsPublication(reasons))
            scan.push(await describe(prisma, kind, row));
        }
      }

    const plan = {
      generatedAt: new Date().toISOString(),
      mode: "dry-run",
      writes: 0,
      targets,
      scan: args.scan
        ? {
            limitPerKind: args.limit,
            cursor: args.cursor,
            nextCursors,
            flagged: scan.length,
            records: scan,
          }
        : null,
      summary: {
        requested: args.slugs.length,
        resolved: targets.filter((target) => target.matches === 1).length,
        ambiguous: targets.filter((target) => target.matches > 1).length,
        missing: targets.filter((target) => target.matches === 0).length,
        proposedWithdrawals: [
          ...targets.flatMap((target) => target.records),
          ...scan,
        ].filter((record) => record.proposal.action !== "NONE").length,
      },
    };

    const json = `${JSON.stringify(plan, null, 2)}\n`;
    process.stdout.write(json);
    if (args.out) writeFileSync(args.out, json, "utf8");
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module)
  main().catch((error: Error) => {
    process.stderr.write(`publication-quality-inventory: ${error.message}\n`);
    process.exit(1);
  });
