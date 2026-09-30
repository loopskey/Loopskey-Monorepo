const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const TARGET_COURSES = Number(process.env.BENCH_LANDING_COURSES ?? 32500);
const TARGET_PER_OTHER_KIND = Number(process.env.BENCH_LANDING_OTHER_KIND ?? 60000);
const RUNS = Number(process.env.BENCH_RUNS ?? 5);
const RARE_NEEDLE = "zzyzxpresenter";

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
  const rows = await prisma.$queryRawUnsafe(
    `EXPLAIN (ANALYZE, BUFFERS) ${sql}`,
  );
  return rows.map((row) => row["QUERY PLAN"]).join("\n");
};

const seedCourses = async () => {
  const existing = Number(
    (
      await prisma.$queryRawUnsafe(
        `SELECT count(*)::int AS count FROM "Course" WHERE id LIKE 'bench_landing_course_%'`,
      )
    )[0].count,
  );
  if (existing >= TARGET_COURSES) return existing;
  process.stdout.write(
    `  Course: growing from ${existing} to ${TARGET_COURSES} ... `,
  );
  const started = Date.now();
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Course" (
      id, slug, title, instructor, description, category, level, status,
      "isFree", currency, "createdAt", "updatedAt"
    )
    SELECT
      'bench_landing_course_' || lpad(g::text, 8, '0'),
      'bench-landing-course-' || lpad(g::text, 8, '0'),
      CASE
        WHEN g = 1 THEN 'React Fundamentals for Professionals'
        WHEN g % 500 = 0 THEN 'Advanced React Native Patterns'
        WHEN g % 37 = 0 THEN 'A course that mentions React only in its long description'
        ELSE (ARRAY['Python','Leadership','Excel','Marketing','Cloud','Design',
                    'Finance','Compliance','Negotiation','Analytics'])[1 + (g % 10)]
          || ' Fundamentals ' || g
      END,
      'Instructor ' || (g % 5000),
      CASE
        WHEN g % 37 = 0 THEN 'This long description eventually mentions React somewhere in the middle of many unrelated sentences about professional development, career growth, and continuing education across a wide variety of unrelated technical and non-technical subjects that a search engine must not fuzzy-match against.'
        ELSE 'Benchmark seed row ' || g || ' with unrelated filler description content repeated for length and realism across the catalogue at scale.'
      END,
      'TECHNOLOGY'::"CourseCategory",
      'ALL_LEVELS'::"CourseLevel",
      'PUBLISHED'::"CourseStatus",
      (g % 3 = 0),
      'USD',
      now() - (g % 200000) * interval '1 minute',
      now()
    FROM generate_series(${existing + 1}, ${TARGET_COURSES}) g
    ON CONFLICT DO NOTHING`);
  await prisma.$executeRawUnsafe(`ANALYZE "Course"`);
  console.log(`${((Date.now() - started) / 1000).toFixed(1)}s`);
  return TARGET_COURSES;
};

const ATTRIBUTION_VALUE_EXPR = `
  CASE
    WHEN g = 1 THEN '${RARE_NEEDLE}'
    ELSE (ARRAY['Morgan Lee','Priya Shah','Sam Okafor','Jordan Diaz','Alex Chen',
                'Riley Novak','Taylor Kim','Devon Ruiz'])[1 + (g % 8)] || ' ' || (g % 500)
  END`;

const seedOtherKind = async (table, kind, count, extraCols, extraSelect) => {
  const existing = Number(
    (
      await prisma.$queryRawUnsafe(
        `SELECT count(*)::int AS count FROM "${table}" WHERE id LIKE 'bench_landing_${kind}_%'`,
      )
    )[0].count,
  );
  if (existing >= count) return existing;
  process.stdout.write(`  ${table}: growing from ${existing} to ${count} ... `);
  const started = Date.now();
  await prisma.$executeRawUnsafe(`
    INSERT INTO "${table}" (
      id, slug, title, description, category, status, "createdAt", "updatedAt"${extraCols}
    )
    SELECT
      'bench_landing_${kind}_' || lpad(g::text, 8, '0'),
      'bench-landing-${kind}-' || lpad(g::text, 8, '0'),
      (ARRAY['Python','Leadership','Excel','Marketing','Cloud'])[1 + (g % 5)]
        || ' Fundamentals ' || g,
      'Benchmark seed row ' || g || ' unrelated filler description.',
      ${
        table === "Event"
          ? "'TECHNOLOGY'::\"EventCategory\""
          : table === "Podcast"
            ? "'AI'::\"PodcastCategory\""
            : "'DATA'::\"YouTubeCategory\""
      },
      ${
        table === "Event"
          ? "'PUBLISHED'::\"EventStatus\""
          : table === "Podcast"
            ? "'PUBLISHED'::\"PodcastStatus\""
            : "'PUBLISHED'::\"YouTubeChannelStatus\""
      },
      now() - (g % 200000) * interval '1 minute',
      now()${extraSelect}
    FROM generate_series(${existing + 1}, ${count}) g
    ON CONFLICT DO NOTHING`);
  await prisma.$executeRawUnsafe(`ANALYZE "${table}"`);
  console.log(`${((Date.now() - started) / 1000).toFixed(1)}s`);
  return count;
};

const OLD_STYLE_COURSE_SEARCH = (term) => `
  WITH ranked_courses AS (
    SELECT
      c.*,
      GREATEST(
        similarity(c."title", '${term}'),
        similarity(c."instructor", '${term}'),
        similarity(c."description", '${term}')
      ) AS "searchRank"
    FROM "Course" c
    WHERE c."deletedAt" IS NULL
      AND c."status" = 'PUBLISHED'::"CourseStatus"
      AND (
        c."title" ILIKE '%${term}%'
        OR c."instructor" ILIKE '%${term}%'
        OR c."description" ILIKE '%${term}%'
        OR c."title" % '${term}'
        OR c."instructor" % '${term}'
        OR c."description" % '${term}'
      )
  )
  SELECT ranked_courses.*, COUNT(*) OVER() AS "totalCount"
  FROM ranked_courses
  ORDER BY "searchRank" DESC, "createdAt" DESC, "id" DESC
  LIMIT 13`;

const NEW_COURSE_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT
      c."id", c."slug", c."title", c."imageUrl",
      c."category"::text AS category, c."rating", c."durationMinutes",
      c."createdAt",
      CASE
        WHEN c."title" ILIKE '%${term}%' THEN 3
        WHEN c."instructor" ILIKE '%${term}%' THEN 2
        ELSE 1
      END AS band
    FROM "Course" c
    WHERE c."deletedAt" IS NULL
      AND c."status" = 'PUBLISHED'::"CourseStatus"
      AND (
        c."title" ILIKE '%${term}%'
        OR c."instructor" ILIKE '%${term}%'
        OR c."description" ILIKE '%${term}%'
      )
    ORDER BY band DESC, c."createdAt" DESC, c."id" ASC
    LIMIT 12
  ),
  fuzzy_matches AS (
    SELECT
      c."id", c."slug", c."title", c."imageUrl",
      c."category"::text AS category, c."rating", c."durationMinutes",
      c."createdAt",
      GREATEST(
        similarity(c."title", '${term}'),
        similarity(c."instructor", '${term}')
      ) AS "fuzzyScore"
    FROM "Course" c
    WHERE c."deletedAt" IS NULL
      AND c."status" = 'PUBLISHED'::"CourseStatus"
      AND c."id" NOT IN (SELECT "id" FROM exact_matches)
      AND (c."title" % '${term}' OR c."instructor" % '${term}')
    ORDER BY "fuzzyScore" DESC, c."createdAt" DESC, c."id" ASC
    LIMIT GREATEST(12 - (SELECT COUNT(*)::int FROM exact_matches), 0)
  )
  SELECT "id", "slug", "title", "imageUrl", category, "rating",
    "durationMinutes", "createdAt", band::float AS score
  FROM exact_matches
  UNION ALL
  SELECT "id", "slug", "title", "imageUrl", category, "rating",
    "durationMinutes", "createdAt", LEAST("fuzzyScore", 0.99)::float AS score
  FROM fuzzy_matches`;

const NEW_EVENT_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT e."id"
    FROM "Event" e
    WHERE e."deletedAt" IS NULL
      AND e."status" = 'PUBLISHED'::"EventStatus"
      AND (
        e."title" ILIKE '%${term}%'
        OR COALESCE(e."speaker", '') ILIKE '%${term}%'
        OR COALESCE(e."organizer", '') ILIKE '%${term}%'
        OR COALESCE(e."location", '') ILIKE '%${term}%'
        OR e."description" ILIKE '%${term}%'
      )
    LIMIT 12
  )
  SELECT * FROM exact_matches`;

const NEW_PODCAST_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT p."id"
    FROM "Podcast" p
    WHERE p."deletedAt" IS NULL
      AND p."status" = 'PUBLISHED'::"PodcastStatus"
      AND (
        p."title" ILIKE '%${term}%'
        OR p."host" ILIKE '%${term}%'
        OR p."description" ILIKE '%${term}%'
      )
    LIMIT 12
  )
  SELECT * FROM exact_matches`;

const NEW_YOUTUBE_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT yc."id"
    FROM "YouTubeChannel" yc
    WHERE yc."deletedAt" IS NULL
      AND yc."status" = 'PUBLISHED'::"YouTubeChannelStatus"
      AND (
        yc."title" ILIKE '%${term}%'
        OR COALESCE(yc."provider", '') ILIKE '%${term}%'
        OR COALESCE(yc."description", '') ILIKE '%${term}%'
      )
    LIMIT 12
  )
  SELECT * FROM exact_matches`;

const TERMS = {
  exact: "React",
  broad: "Fundamentals",
  typo: "Reakt",
  noResult: "zzyzxquilibrium",
};

async function main() {
  console.log("=== Seeding production-like catalogue scale ===");
  await seedCourses();
  await seedOtherKind(
    "Event",
    "event",
    TARGET_PER_OTHER_KIND,
    ', "type", "deliveryMode", "startDate", timezone, speaker, organizer',
    `, 'WEBINAR'::"EventType", 'LIVE_ONLINE'::"EventDeliveryMode", now(), 'UTC', ${ATTRIBUTION_VALUE_EXPR}, ${ATTRIBUTION_VALUE_EXPR}`,
  );
  await seedOtherKind(
    "Podcast",
    "podcast",
    TARGET_PER_OTHER_KIND,
    ", host",
    `, ${ATTRIBUTION_VALUE_EXPR}`,
  );
  await seedOtherKind(
    "YouTubeChannel",
    "youtube",
    TARGET_PER_OTHER_KIND,
    ", provider",
    `, ${ATTRIBUTION_VALUE_EXPR}`,
  );

  const courseCount = await prisma.course.count({ where: { status: "PUBLISHED" } });
  console.log(`\nPublished Course rows: ${courseCount}`);

  console.log("\n=== BASELINE: existing /content-style Course search (description similarity) ===");
  console.log(`  term: "${TERMS.exact}"`);
  const baselinePlan = await explainOf(OLD_STYLE_COURSE_SEARCH(TERMS.exact));
  console.log(baselinePlan.split("\n").map((line) => "    " + line).join("\n"));
  const baselineMs = await time(() =>
    prisma.$queryRawUnsafe(OLD_STYLE_COURSE_SEARCH(TERMS.exact)),
  );
  console.log(`  median execution: ${baselineMs.toFixed(1)} ms`);

  console.log("\n=== NEW: landing catalogue Course search (exact-first, bounded fuzzy) ===");
  const results = {};
  for (const [label, term] of Object.entries(TERMS)) {
    const plan = await explainOf(NEW_COURSE_SEARCH(term));
    const ms = await time(() => prisma.$queryRawUnsafe(NEW_COURSE_SEARCH(term)));
    results[label] = ms;
    const usesBitmap = /Bitmap Index Scan/.test(plan);
    const usesDescriptionSimilarity = /similarity\([^)]*"description"/.test(plan);
    console.log(
      `  ${label.padEnd(10)} term="${term}"  median ${ms.toFixed(1).padStart(8)} ms` +
        `  bitmapIndex=${usesBitmap}  descriptionSimilarity=${usesDescriptionSimilarity}`,
    );
    if (label === "exact") {
      console.log(plan.split("\n").map((line) => "    " + line).join("\n"));
    }
  }

  console.log("\n=== NEW: unified per-domain search latency (max = simulated concurrent unified call) ===");
  for (const [label, term] of Object.entries(TERMS)) {
    const courseMs = results[label];
    const eventMs = await time(() => prisma.$queryRawUnsafe(NEW_EVENT_SEARCH(term)));
    const podcastMs = await time(() => prisma.$queryRawUnsafe(NEW_PODCAST_SEARCH(term)));
    const youtubeMs = await time(() => prisma.$queryRawUnsafe(NEW_YOUTUBE_SEARCH(term)));
    const unified = Math.max(courseMs, eventMs, podcastMs, youtubeMs);
    console.log(
      `  ${label.padEnd(10)} course=${courseMs.toFixed(1).padStart(7)}ms  event=${eventMs.toFixed(1).padStart(7)}ms` +
        `  podcast=${podcastMs.toFixed(1).padStart(7)}ms  youtube=${youtubeMs.toFixed(1).padStart(7)}ms` +
        `  unified(max)=${unified.toFixed(1).padStart(7)}ms`,
    );
  }

  console.log("\n=== NEW migration indexes: reachability at scale (rare-needle fuzzy match) ===");
  const attributionChecks = [
    { table: "Event", column: "speaker", index: "Event_speaker_trgm_idx" },
    { table: "Event", column: "organizer", index: "Event_organizer_trgm_idx" },
    { table: "Podcast", column: "host", index: "Podcast_host_trgm_idx" },
    { table: "YouTubeChannel", column: "provider", index: "YouTubeChannel_provider_trgm_idx" },
  ];
  for (const check of attributionChecks) {
    const sql = `SELECT "id" FROM "${check.table}" WHERE "${check.column}" % '${RARE_NEEDLE}' LIMIT 12`;
    const plan = await explainOf(sql);
    const usesTargetIndex = plan.includes(check.index);
    const isSeqScan = /Seq Scan/.test(plan) && !usesTargetIndex;
    console.log(
      `  ${check.table}.${check.column}  usesIndex(${check.index})=${usesTargetIndex}  seqScan=${isSeqScan}`,
    );
    if (!usesTargetIndex) {
      console.log(plan.split("\n").map((line) => "    " + line).join("\n"));
    }
  }

  console.log("\n=== Index inventory (fuzzy-eligible short fields) ===");
  const indexRows = await prisma.$queryRawUnsafe(`
    SELECT indexname FROM pg_indexes
    WHERE indexdef ILIKE '%gin%'
      AND (
        indexname LIKE 'Course_%_trgm_idx'
        OR indexname LIKE 'Event_%_trgm_idx'
        OR indexname LIKE 'Podcast_%_trgm_idx'
        OR indexname LIKE 'YouTubeChannel_%_trgm_idx'
      )
    ORDER BY indexname`);
  indexRows.forEach((row) => console.log(`  ${row.indexname}`));

  console.log("\n=== VERDICT ===");
  console.table([
    {
      metric: "Baseline Course DB work (recorded prod: 7644.802 ms)",
      value: `${baselineMs.toFixed(1)} ms`,
    },
    {
      metric: "New Course DB work, exact term (target <= 500 ms)",
      value: `${results.exact.toFixed(1)} ms`,
    },
    {
      metric: "Speedup",
      value: `${(baselineMs / results.exact).toFixed(1)}x`,
    },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
