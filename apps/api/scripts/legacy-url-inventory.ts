import { ContentUrlNamespace, PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";

import { isWellFormedContentSlug } from "@utils/content-slug.util";

const BENCHMARK_ROWS: ManifestRow[] = [
  { namespace: "COURSE", slug: "risk-management-in-projects" },
  { namespace: "COURSE", slug: "client-relationship-management-3" },
  { namespace: "COURSE", slug: "stakeholder-management" },
  { namespace: "COURSE", slug: "coursera-jvq5nhtgee2jhw516rtnyq" },
];
const MAX_ROWS = 500;
const MAX_HINTS = 5;
const MIN_EVIDENCE_LENGTH = 10;
const STABLE_ID_PATTERN = /^[a-z0-9]+-([a-z0-9_-]{8,})$/;
const USAGE = `Read-only legacy URL inventory. It never writes.

  npx ts-node -r tsconfig-paths/register scripts/legacy-url-inventory.ts [--manifest rows.json] [--out plan.json]

  --manifest <path>  JSON array of rows: { namespace, slug, targetId?, disposition?, evidence?, reviewer? }.
                     disposition "REMOVED" records a reviewed deliberate removal. Defaults to the
                     four benchmark course paths with no evidence.
  --out <path>       Also write the JSON plan to a file.
`;

type ManifestRow = {
  namespace: string;
  slug: string;
  targetId?: string;
  disposition?: "REMOVED";
  evidence?: string;
  reviewer?: string;
};

type Target = { id: string; slug: string; isPublic: boolean } | null;

type Disposition =
  | "CURRENT"
  | "MOVED_SAME_ENTITY"
  | "REMOVED"
  | "PROPOSED_ATTACH"
  | "CONFLICTING"
  | "UNRESOLVED"
  | "INVALID";

const parseArgs = (argv: string[]) => {
  let manifest: string | null = null;
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
    if (token === "--manifest") manifest = value();
    else if (token === "--out") out = value();
    else if (token === "--help") {
      process.stdout.write(USAGE);
      process.exit(0);
    } else throw new Error(`Unexpected argument ${token}`);
  }
  return { manifest, out };
};

const readRows = (path: string | null): ManifestRow[] => {
  if (!path) return BENCHMARK_ROWS;
  const rows: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_ROWS)
    throw new Error(`The manifest must be an array of 1 to ${MAX_ROWS} rows`);
  return rows as ManifestRow[];
};

const isCatalogNamespace = (value: string): value is ContentUrlNamespace =>
  (
    [
      ContentUrlNamespace.COURSE,
      ContentUrlNamespace.EVENT,
      ContentUrlNamespace.PODCAST,
      ContentUrlNamespace.YOUTUBE,
    ] as string[]
  ).includes(value);

const targetOf = async (
  prisma: PrismaClient,
  namespace: ContentUrlNamespace,
  id: string,
): Promise<Target> => {
  const select = { id: true, slug: true, status: true, deletedAt: true };
  const row =
    namespace === ContentUrlNamespace.COURSE
      ? await prisma.course.findUnique({ where: { id }, select })
      : namespace === ContentUrlNamespace.EVENT
        ? await prisma.event.findUnique({ where: { id }, select })
        : namespace === ContentUrlNamespace.PODCAST
          ? await prisma.podcast.findUnique({ where: { id }, select })
          : await prisma.youTubeChannel.findUnique({ where: { id }, select });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    isPublic: row.status === "PUBLISHED" && !row.deletedAt,
  };
};

const stableIdHints = async (
  prisma: PrismaClient,
  namespace: ContentUrlNamespace,
  slug: string,
) => {
  const stableId = slug.match(STABLE_ID_PATTERN)?.[1];
  if (!stableId) return [];
  const items = await prisma.ingestionItem.findMany({
    where: {
      catalogId: { not: null },
      externalId: { equals: stableId, mode: "insensitive" },
    },
    take: MAX_HINTS,
    select: {
      catalogId: true,
      externalId: true,
      source: { select: { slug: true, kind: true } },
    },
  });
  const hints = [];
  for (const item of items) {
    const target = await targetOf(prisma, namespace, item.catalogId!);
    if (target)
      hints.push({
        basis: `ingestion external id ${item.externalId} from source ${item.source.slug}`,
        targetId: target.id,
        currentSlug: target.slug,
        isPublic: target.isPublic,
      });
  }
  return hints;
};

const reviewed = (row: ManifestRow) =>
  Boolean(
    row.reviewer?.trim() &&
      (row.evidence?.trim().length ?? 0) >= MIN_EVIDENCE_LENGTH,
  );

const classify = async (prisma: PrismaClient, row: ManifestRow) => {
  const slug = (row.slug ?? "").trim().toLowerCase();
  const base = {
    namespace: row.namespace,
    slug,
    evidence: row.evidence ?? null,
    reviewer: row.reviewer ?? null,
  };
  const result = (
    disposition: Disposition,
    detail: Record<string, unknown> = {},
  ) => ({ ...base, disposition, ...detail });

  if (!isCatalogNamespace(row.namespace) || !isWellFormedContentSlug(slug))
    return result("INVALID", {
      note: "Unknown namespace or malformed slug.",
    });
  const namespace = row.namespace;

  const claim = await prisma.contentUrlClaim.findUnique({
    where: { namespace_slug: { namespace, slug } },
    select: { targetId: true, isCurrent: true, retiredAt: true },
  });

  if (claim) {
    const target = await targetOf(prisma, namespace, claim.targetId);
    if (row.targetId && row.targetId !== claim.targetId)
      return result("CONFLICTING", {
        note: "The path is already reserved by a different record than the manifest names. Nothing can be reassigned.",
        claimedBy: claim.targetId,
      });
    if (!target?.isPublic)
      return result("REMOVED", {
        note: "Reserved by a record that is hidden or deleted: the path stays a real 404.",
        httpExpected: 404,
      });
    if (claim.isCurrent)
      return result("CURRENT", {
        targetId: target.id,
        currentSlug: target.slug,
        httpExpected: 200,
      });
    return result("MOVED_SAME_ENTITY", {
      targetId: target.id,
      currentSlug: target.slug,
      retiredAt: claim.retiredAt?.toISOString() ?? null,
      httpExpected: 308,
      note: "Already redirects in one hop; no action.",
    });
  }

  if (row.disposition === "REMOVED")
    return reviewed(row)
      ? result("REMOVED", {
          note: "Reviewed deliberate removal: the path stays a real 404.",
          httpExpected: 404,
        })
      : result("UNRESOLVED", {
          note: "A removal needs evidence and a reviewer before it is recorded.",
        });

  if (row.targetId) {
    if (!reviewed(row))
      return result("UNRESOLVED", {
        note: "A target was named without evidence and a reviewer; identity is not proven.",
      });
    const target = await targetOf(prisma, namespace, row.targetId);
    if (!target?.isPublic)
      return result("UNRESOLVED", {
        note: "The named target is missing, hidden or deleted; nothing is attached to it.",
      });
    return result("PROPOSED_ATTACH", {
      targetId: target.id,
      currentSlug: target.slug,
      httpExpected: 308,
      action: {
        mutation: "attachRetiredContentSlug",
        input: {
          kind: namespace,
          contentId: target.id,
          retiredSlug: slug,
          expectedSlug: target.slug,
          evidence: row.evidence,
        },
      },
    });
  }

  return result("UNRESOLVED", {
    note: "No reservation and no verified target. Matching words never prove identity; only a stable original id or owner confirmation does.",
    identityHints: await stableIdHints(prisma, namespace, slug),
  });
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const rows = readRows(args.manifest);
  const prisma = new PrismaClient();
  try {
    const results = [];
    for (const row of rows) results.push(await classify(prisma, row));
    const counts = results.reduce<Record<string, number>>((total, row) => {
      total[row.disposition] = (total[row.disposition] ?? 0) + 1;
      return total;
    }, {});
    const plan = {
      generatedAt: new Date().toISOString(),
      mode: "dry-run",
      writes: 0,
      counts,
      rows: results,
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
    process.stderr.write(`legacy-url-inventory: ${error.message}\n`);
    process.exit(1);
  });
