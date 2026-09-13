const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const CATALOG_PER_KIND = Number(process.env.BENCH_CATALOG_PER_KIND ?? 50000);
const RUNS = Number(process.env.BENCH_RUNS ?? 5);
const COMMON_TERM = "guide";
const RARE_TERM = "zzyzxquilibrium";

const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const time = async (fn) => {
  await fn();
  const samples = [];
  for (let run = 0; run < RUNS; run += 1) {
    const started = process.hrtime.bigint();
    await fn();
    samples.push(Number(process.hrtime.bigint() - started) / 1e6);
  }
  return median(samples);
};

const explainOf = async (sql) => {
  const rows = await prisma.$queryRawUnsafe(`EXPLAIN (ANALYZE) ${sql}`);
  return rows.map((row) => row["QUERY PLAN"]).join("\n");
};

const usesIndex = (plan) =>
  /Index (Only )?Scan|Bitmap Index Scan/.test(plan) && !/Seq Scan/.test(plan);

const growCatalog = async (table, kind, count) => {
  const existing = Number(
    (
      await prisma.$queryRawUnsafe(
        `SELECT count(*)::int AS count FROM "${table}" WHERE id LIKE 'bench_${kind}_%'`,
      )
    )[0].count,
  );
  if (existing >= count) return existing;
  process.stdout.write(`  ${table}: growing from ${existing} to ${count} ... `);
  const started = Date.now();
  const category =
    table === "Course"
      ? "'TECHNOLOGY'::\"CourseCategory\""
      : table === "Event"
        ? "'TECHNOLOGY'::\"EventCategory\""
        : table === "Podcast"
          ? "'BUSINESS'::\"PodcastCategory\""
          : "'BUSINESS'::\"YouTubeCategory\"";
  const titleExpr = `
    CASE
      WHEN g = 1 THEN 'The ${RARE_TERM.charAt(0).toUpperCase()}${RARE_TERM.slice(1)} Masterclass'
      WHEN g % 40 = 0 THEN 'The Complete ' || (ARRAY['Python','Leadership','Excel','Marketing','Cloud','Design','Finance','Compliance'])[1 + (g % 8)] || ' ${COMMON_TERM.charAt(0).toUpperCase()}${COMMON_TERM.slice(1)}'
      ELSE (ARRAY['Python','Leadership','Excel','Marketing','Cloud','Design','Finance','Compliance','Negotiation','Analytics'])[1 + (g % 10)] || ' Fundamentals ' || g
    END`;
  const idExpr = `'bench_' || '${kind}' || '_' || lpad(g::text, 8, '0')`;
  const extra =
    table === "Event"
      ? `, 'WEBINAR'::"EventType", 'LIVE_ONLINE'::"EventDeliveryMode", now(), 'UTC'`
      : "";
  const extraCols = table === "Event" ? `, "type", "deliveryMode", "startDate", timezone` : "";
  const secondaryCol =
    table === "Course" ? "instructor" : table === "Podcast" ? "host" : null;
  const secondaryColSql = secondaryCol ? `, "${secondaryCol}"` : "";
  const secondaryValSql = secondaryCol ? `, 'Bench Presenter ' || (g % 500)` : "";
  await prisma.$executeRawUnsafe(`
    INSERT INTO "${table}" (id, slug, title, description, category, "createdAt", "updatedAt"${secondaryColSql}${extraCols})
    SELECT
      ${idExpr},
      ${idExpr},
      ${titleExpr},
      'Benchmark seed row ' || g,
      ${category},
      now() - (g % 200000) * interval '1 minute',
      now()${secondaryValSql}${extra}
    FROM generate_series(${existing + 1}, ${count}) g
    ON CONFLICT DO NOTHING`);
  await prisma.$executeRawUnsafe(`ANALYZE "${table}"`);
  console.log(`${((Date.now() - started) / 1000).toFixed(1)}s`);
  return count;
};

const ensureSources = async () => {
  const kinds = [
    ["COURSE", "course"],
    ["EVENT", "event"],
    ["PODCAST", "podcast"],
    ["YOUTUBE", "youtube"],
  ];
  const ids = {};
  for (const [kind, slugPrefix] of kinds) {
    ids[slugPrefix] = [];
    for (const n of [1, 2]) {
      const id = `bench_source_${slugPrefix}_${n}`;
      await prisma.$executeRawUnsafe(`
        INSERT INTO "IngestionSource" (id, slug, name, kind, "fieldMap", "createdAt", "updatedAt")
        VALUES ('${id}', '${id}', 'Bench ${slugPrefix} source ${n}', '${kind}'::"IngestionContentKind", '{}', now(), now())
        ON CONFLICT (id) DO NOTHING`);
      ids[slugPrefix].push(id);
    }
  }
  return ids;
};

const growItems = async (kind, table, sourceIds, count) => {
  const existing = Number(
    (
      await prisma.$queryRawUnsafe(
        `SELECT count(*)::int AS count FROM "IngestionItem" WHERE id LIKE 'bench_item_${kind}_%'`,
      )
    )[0].count,
  );
  if (existing >= count) return existing;
  process.stdout.write(
    `  IngestionItem (${kind}): growing from ${existing} to ${count} ... `,
  );
  const started = Date.now();
  const catalogIdExpr = `'bench_' || '${kind}' || '_' || lpad(g::text, 8, '0')`;
  await prisma.$executeRawUnsafe(`
    INSERT INTO "IngestionItem"
      (id, "sourceId", "externalId", "canonicalHash", state, "catalogId",
       "firstSeenAt", "lastSeenAt", "createdAt", "updatedAt")
    SELECT
      'bench_item_${kind}_' || lpad(g::text, 8, '0'),
      CASE WHEN g % 2 = 0 THEN '${sourceIds[0]}' ELSE '${sourceIds[1]}' END,
      'bench_ext_${kind}_' || g,
      md5(g::text),
      (CASE
        WHEN g % 100 < 70 THEN 'ACCEPTED'
        WHEN g % 100 < 90 THEN 'PENDING'
        WHEN g % 100 < 98 THEN 'REJECTED'
        ELSE 'STALE'
      END)::"IngestionItemState",
      ${catalogIdExpr},
      now() - (g % 200000) * interval '1 minute',
      now() - (g % 200000) * interval '1 minute',
      now() - (g % 200000) * interval '1 minute',
      now()
    FROM generate_series(${existing + 1}, ${count}) g
    ON CONFLICT DO NOTHING`);
  console.log(`${((Date.now() - started) / 1000).toFixed(1)}s`);
  return count;
};

const dropNewIndexes = () =>
  Promise.all([
    prisma.$executeRawUnsafe(
      `DROP INDEX IF EXISTS "IngestionItem_sourceId_state_createdAt_id_idx"`,
    ),
    prisma.$executeRawUnsafe(
      `DROP INDEX IF EXISTS "IngestionItem_state_createdAt_id_idx"`,
    ),
    prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "IngestionItem_catalogId_idx"`),
  ]).then(() => prisma.$executeRawUnsafe(`ANALYZE "IngestionItem"`));

const createNewIndexes = async () => {
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "IngestionItem_sourceId_state_createdAt_id_idx" ON "IngestionItem" ("sourceId", "state", "createdAt", "id")`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "IngestionItem_state_createdAt_id_idx" ON "IngestionItem" ("state", "createdAt", "id")`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "IngestionItem_catalogId_idx" ON "IngestionItem" ("catalogId")`,
  );
  await prisma.$executeRawUnsafe(`ANALYZE "IngestionItem"`);
};

const matchingCatalogIdsSql = (term) => `
  SELECT id FROM "Course"  WHERE title ILIKE '%${term}%' OR title % '${term}'
  UNION
  SELECT id FROM "Event"   WHERE title ILIKE '%${term}%' OR title % '${term}'
  UNION
  SELECT id FROM "Podcast" WHERE title ILIKE '%${term}%' OR title % '${term}'
  UNION
  SELECT id FROM "YouTubeChannel" WHERE title ILIKE '%${term}%' OR title % '${term}'`;

const stateOnlyPageSql = `
  SELECT ii.* FROM "IngestionItem" ii
  WHERE ii."state" = 'PENDING'
  ORDER BY ii."createdAt" DESC, ii.id DESC LIMIT 21`;

const stateOnlyCountSql = `SELECT count(*) FROM "IngestionItem" WHERE "state" = 'PENDING'`;

const sourceAndStatePageSql = (sourceId) => `
  SELECT ii.* FROM "IngestionItem" ii
  WHERE ii."sourceId" = '${sourceId}' AND ii."state" = 'ACCEPTED'
  ORDER BY ii."createdAt" DESC, ii.id DESC LIMIT 21`;

const oldCappedSearchSql = (term) => `
  WITH matched(id) AS (${matchingCatalogIdsSql(term)} LIMIT 500)
  SELECT ii.* FROM "IngestionItem" ii
  WHERE ii."catalogId" IN (SELECT id FROM matched)
  ORDER BY ii."createdAt" DESC, ii.id DESC LIMIT 21`;

const newJoinedSearchSql = (term) => `
  WITH matched AS (${matchingCatalogIdsSql(term)})
  SELECT ii.* FROM "IngestionItem" ii
  JOIN matched ON matched.id = ii."catalogId"
  ORDER BY ii."createdAt" DESC, ii.id DESC LIMIT 21`;

const newJoinedCountSql = (term) => `
  WITH matched AS (${matchingCatalogIdsSql(term)})
  SELECT count(*) FROM "IngestionItem" ii
  JOIN matched ON matched.id = ii."catalogId"`;

async function main() {
  console.log(`Seeding catalog tables to ${CATALOG_PER_KIND} rows each ...`);
  await growCatalog("Course", "course", CATALOG_PER_KIND);
  await growCatalog("Event", "event", CATALOG_PER_KIND);
  await growCatalog("Podcast", "podcast", CATALOG_PER_KIND);
  await growCatalog("YouTubeChannel", "youtube", CATALOG_PER_KIND);

  console.log("\nEnsuring ingestion sources ...");
  const sourceIds = await ensureSources();

  const itemsPerKind = CATALOG_PER_KIND;
  console.log(`\nSeeding IngestionItem to ${itemsPerKind} rows per kind ...`);
  await growItems("course", "Course", sourceIds.course, itemsPerKind);
  await growItems("event", "Event", sourceIds.event, itemsPerKind);
  await growItems("podcast", "Podcast", sourceIds.podcast, itemsPerKind);
  await growItems("youtube", "YouTubeChannel", sourceIds.youtube, itemsPerKind);
  await prisma.$executeRawUnsafe(`ANALYZE "IngestionItem"`);

  const totalItems = Number(
    (await prisma.$queryRawUnsafe(`SELECT count(*)::int AS count FROM "IngestionItem"`))[0]
      .count,
  );
  const matchCount = Number(
    (
      await prisma.$queryRawUnsafe(
        `SELECT count(*)::int AS count FROM (${matchingCatalogIdsSql(COMMON_TERM)}) m`,
      )
    )[0].count,
  );
  console.log(
    `\nIngestionItem rows: ${totalItems}   catalog rows matching "${COMMON_TERM}": ${matchCount}`,
  );

  console.log(
    "\n=== WITHOUT the new indexes (sourceId_state only, what shipped before this feature) ===",
  );
  await dropNewIndexes();
  const beforeStateOnly = await time(() => prisma.$queryRawUnsafe(stateOnlyPageSql));
  const beforeStateOnlyCount = await time(() => prisma.$queryRawUnsafe(stateOnlyCountSql));
  console.log(`  state-only page:  ${beforeStateOnly.toFixed(0)} ms`);
  console.log(`  state-only count: ${beforeStateOnlyCount.toFixed(0)} ms`);
  console.log("\n  plan for the state-only page read:");
  const beforePlan = await explainOf(stateOnlyPageSql);
  console.log(beforePlan.split("\n").map((l) => "    " + l).join("\n"));
  console.log(`  -> ${usesIndex(beforePlan) ? "index scan" : "SEQUENTIAL SCAN"}`);

  console.log(
    "\n=== old matchingCatalogIds shape: LIMIT 500 on an unordered UNION, then IN-filter ===",
  );
  const oldSearchPlan = await explainOf(oldCappedSearchSql(COMMON_TERM));
  console.log(oldSearchPlan.split("\n").map((l) => "    " + l).join("\n"));
  console.log(
    `  true matches for "${COMMON_TERM}": ${matchCount} -- the old query silently drops ${Math.max(0, matchCount - 500)} of them from candidacy, in no defined order`,
  );

  console.log("\n=== WITH the new indexes ===");
  await createNewIndexes();
  const afterStateOnly = await time(() => prisma.$queryRawUnsafe(stateOnlyPageSql));
  const afterStateOnlyCount = await time(() => prisma.$queryRawUnsafe(stateOnlyCountSql));
  console.log(`  state-only page:  ${afterStateOnly.toFixed(0)} ms`);
  console.log(`  state-only count: ${afterStateOnlyCount.toFixed(0)} ms`);
  console.log("\n  plan for the state-only page read:");
  const afterPlan = await explainOf(stateOnlyPageSql);
  console.log(afterPlan.split("\n").map((l) => "    " + l).join("\n"));
  console.log(`  -> ${usesIndex(afterPlan) ? "index scan" : "SEQUENTIAL SCAN"}`);

  console.log("\n  plan for the sourceId+state page read:");
  const sourceStatePlan = await explainOf(sourceAndStatePageSql(sourceIds.course[0]));
  console.log(sourceStatePlan.split("\n").map((l) => "    " + l).join("\n"));
  console.log(`  -> ${usesIndex(sourceStatePlan) ? "index scan" : "SEQUENTIAL SCAN"}`);

  console.log(
    `\n=== new joined search shape, no cap -- term "${COMMON_TERM}" (${matchCount} true matches, ${((matchCount / totalItems) * 100).toFixed(1)}% of the catalog) ===`,
  );
  const newSearchPage = await time(() => prisma.$queryRawUnsafe(newJoinedSearchSql(COMMON_TERM)));
  const newSearchCount = await time(() =>
    prisma.$queryRawUnsafe(newJoinedCountSql(COMMON_TERM)),
  );
  console.log(`  page (LIMIT 21):     ${newSearchPage.toFixed(0)} ms`);
  console.log(`  count (all matches): ${newSearchCount.toFixed(0)} ms`);
  console.log("\n  plan for the joined page read:");
  const newSearchPlan = await explainOf(newJoinedSearchSql(COMMON_TERM));
  console.log(newSearchPlan.split("\n").map((l) => "    " + l).join("\n"));
  console.log(
    `  -> catalogId join reaches ${usesIndex(newSearchPlan) ? "an index" : "a SEQUENTIAL SCAN"} on IngestionItem`,
  );

  console.log(
    `\n=== rare term "${RARE_TERM}" -- confirms the trigram index also serves a narrow, realistic query ===`,
  );
  const rareCount = Number(
    (
      await prisma.$queryRawUnsafe(
        `SELECT count(*)::int AS count FROM (${matchingCatalogIdsSql(RARE_TERM)}) m`,
      )
    )[0].count,
  );
  const rarePlan = await explainOf(newJoinedSearchSql(RARE_TERM));
  console.log(`  true matches: ${rareCount}`);
  console.log(rarePlan.split("\n").map((l) => "    " + l).join("\n"));

  console.log("\n=== confirmed indexes on IngestionItem ===");
  const indexes = await prisma.$queryRawUnsafe(
    `SELECT indexname FROM pg_indexes WHERE tablename = 'IngestionItem' ORDER BY indexname`,
  );
  console.table(indexes);

  console.log("\n=== VERDICT ===");
  console.table([
    {
      query: "state-only page (default admin view)",
      "no index": `${beforeStateOnly.toFixed(0)} ms`,
      "with index": `${afterStateOnly.toFixed(0)} ms`,
      "plan before": usesIndex(beforePlan) ? "index" : "SEQ SCAN",
      "plan after": usesIndex(afterPlan) ? "index" : "SEQ SCAN",
    },
    {
      query: "state-only count",
      "no index": `${beforeStateOnlyCount.toFixed(0)} ms`,
      "with index": `${afterStateOnlyCount.toFixed(0)} ms`,
      "plan before": "n/a",
      "plan after": "n/a",
    },
    {
      query: `joined search "${COMMON_TERM}" (${matchCount} matches) page`,
      "no index": "n/a (new query shape)",
      "with index": `${newSearchPage.toFixed(0)} ms`,
      "plan before": "n/a",
      "plan after": usesIndex(newSearchPlan) ? "index" : "SEQ SCAN",
    },
    {
      query: `joined search "${COMMON_TERM}" total count`,
      "no index": "n/a (new query shape)",
      "with index": `${newSearchCount.toFixed(0)} ms`,
      "plan before": "n/a",
      "plan after": "n/a",
    },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
