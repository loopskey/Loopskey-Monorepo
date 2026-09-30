// Benchmarks the /content page's per-tab list search (courses/events/
// podcasts/youtube channels) before and after replacing the single-CTE,
// unbounded-similarity shape with the bounded exact-first + fuzzy-fallback
// two-CTE architecture already proven by bench-landing-catalog-search.js.
//
// "OLD_*" strings below are verbatim copies of the pre-fix
// findCoursesWithTrgmSearch / EventRepository#search /
// findPodcastsWithTrgmSearch / findChannelsWithTrgmSearch bodies (kept only
// here, as a fixed historical baseline — the live code no longer contains
// this shape). "NEW_*" strings mirror the shape now live in those four
// functions. Reuses the same shared `loopskey_bench` database that
// bench-landing-catalog-search.js seeds; run that script first (or this one
// after it) so Course/Event/Podcast/YouTubeChannel are populated at scale.

const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const RUNS = Number(process.env.BENCH_RUNS ?? 5);
const CANDIDATE_CAP = 500;

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

// ---------------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------------

const OLD_COURSE_SEARCH = (term) => `
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
  LIMIT 21`;

const NEW_COURSE_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT
      c."id", c."slug", c."title", c."instructor", c."imageUrl",
      c."description", c."category", c."level", c."status", c."price",
      c."currency", c."isFree", c."durationMinutes", c."lastUpdatedAt",
      c."requirements", c."learnings", c."rating", c."ratingCount",
      c."professionals", c."isFeatured", c."providerId", c."createdAt",
      c."updatedAt", c."deletedAt",
      (CASE
        WHEN c."title" ILIKE '%${term}%' THEN 3
        WHEN c."instructor" ILIKE '%${term}%' THEN 2
        ELSE 1
      END)::float AS "searchRank"
    FROM "Course" c
    WHERE c."deletedAt" IS NULL
      AND c."status" = 'PUBLISHED'::"CourseStatus"
      AND (
        c."title" ILIKE '%${term}%'
        OR c."instructor" ILIKE '%${term}%'
        OR c."description" ILIKE '%${term}%'
      )
    ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
    LIMIT ${CANDIDATE_CAP}
  ),
  fuzzy_matches AS (
    SELECT
      c."id", c."slug", c."title", c."instructor", c."imageUrl",
      c."description", c."category", c."level", c."status", c."price",
      c."currency", c."isFree", c."durationMinutes", c."lastUpdatedAt",
      c."requirements", c."learnings", c."rating", c."ratingCount",
      c."professionals", c."isFeatured", c."providerId", c."createdAt",
      c."updatedAt", c."deletedAt",
      LEAST(GREATEST(similarity(c."title", '${term}'), similarity(c."instructor", '${term}')), 0.99) AS "searchRank"
    FROM "Course" c
    WHERE c."deletedAt" IS NULL
      AND c."status" = 'PUBLISHED'::"CourseStatus"
      AND c."id" NOT IN (SELECT "id" FROM exact_matches)
      AND (c."title" % '${term}' OR c."instructor" % '${term}')
    ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
    LIMIT GREATEST(${CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
  )
  SELECT * FROM exact_matches
  UNION ALL
  SELECT * FROM fuzzy_matches
  ORDER BY "searchRank" DESC, "createdAt" DESC, "id" DESC
  LIMIT 21`;

const NEW_COURSE_COUNT = (term) => `
  SELECT COUNT(*)::bigint AS count
  FROM "Course" c
  WHERE c."deletedAt" IS NULL
    AND c."status" = 'PUBLISHED'::"CourseStatus"
    AND (
      c."title" ILIKE '%${term}%'
      OR c."instructor" ILIKE '%${term}%'
      OR c."description" ILIKE '%${term}%'
      OR c."title" % '${term}'
      OR c."instructor" % '${term}'
    )`;

// ---------------------------------------------------------------------------
// Podcast — the old shape used `similarity(col, term) > threshold`, which
// gin_trgm_ops cannot accelerate at all (only `%`, `<->`, `<%>`, ILIKE are
// index-eligible), unlike Course/Event's `%` operator.
// ---------------------------------------------------------------------------

const OLD_PODCAST_SEARCH = (term) => `
  WITH ranked_podcasts AS (
    SELECT
      p.*,
      GREATEST(
        similarity(p."title", '${term}'),
        similarity(p."host", '${term}'),
        similarity(p."description", '${term}')
      ) AS "searchRank"
    FROM "Podcast" p
    WHERE p."deletedAt" IS NULL
      AND p."status" = 'PUBLISHED'::"PodcastStatus"
      AND (
        p."title" ILIKE '%${term}%'
        OR p."host" ILIKE '%${term}%'
        OR p."description" ILIKE '%${term}%'
        OR similarity(p."title", '${term}') > 0.15
        OR similarity(p."host", '${term}') > 0.15
        OR similarity(p."description", '${term}') > 0.10
      )
  )
  SELECT ranked_podcasts.*, COUNT(*) OVER() AS "totalCount"
  FROM ranked_podcasts
  ORDER BY "searchRank" DESC, "createdAt" DESC, "id" DESC
  LIMIT 21`;

const NEW_PODCAST_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT
      p."id", p."slug", p."title", p."host", p."imageUrl", p."description",
      p."category", p."status", p."rating", p."ratingCount", p."listeners",
      p."durationMinutes", p."episodeCount", p."isFeatured", p."providerId",
      p."createdAt", p."updatedAt", p."deletedAt",
      (CASE
        WHEN p."title" ILIKE '%${term}%' THEN 3
        WHEN p."host" ILIKE '%${term}%' THEN 2
        ELSE 1
      END)::float AS "searchRank"
    FROM "Podcast" p
    WHERE p."deletedAt" IS NULL
      AND p."status" = 'PUBLISHED'::"PodcastStatus"
      AND (
        p."title" ILIKE '%${term}%'
        OR p."host" ILIKE '%${term}%'
        OR p."description" ILIKE '%${term}%'
      )
    ORDER BY "searchRank" DESC, p."createdAt" DESC, p."id" DESC
    LIMIT ${CANDIDATE_CAP}
  ),
  fuzzy_matches AS (
    SELECT
      p."id", p."slug", p."title", p."host", p."imageUrl", p."description",
      p."category", p."status", p."rating", p."ratingCount", p."listeners",
      p."durationMinutes", p."episodeCount", p."isFeatured", p."providerId",
      p."createdAt", p."updatedAt", p."deletedAt",
      LEAST(GREATEST(similarity(p."title", '${term}'), similarity(p."host", '${term}')), 0.99) AS "searchRank"
    FROM "Podcast" p
    WHERE p."deletedAt" IS NULL
      AND p."status" = 'PUBLISHED'::"PodcastStatus"
      AND p."id" NOT IN (SELECT "id" FROM exact_matches)
      AND (p."title" % '${term}' OR p."host" % '${term}')
    ORDER BY "searchRank" DESC, p."createdAt" DESC, p."id" DESC
    LIMIT GREATEST(${CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
  )
  SELECT * FROM exact_matches
  UNION ALL
  SELECT * FROM fuzzy_matches
  ORDER BY "searchRank" DESC, "createdAt" DESC, "id" DESC
  LIMIT 21`;

// ---------------------------------------------------------------------------
// YouTube — same `similarity() > threshold` bug as Podcast.
// ---------------------------------------------------------------------------

const OLD_YOUTUBE_SEARCH = (term) => `
  WITH ranked_channels AS (
    SELECT
      yc.*,
      GREATEST(
        similarity(yc."title", '${term}'),
        similarity(yc."provider", '${term}'),
        similarity(COALESCE(yc."description", ''), '${term}')
      ) AS "searchRank"
    FROM "YouTubeChannel" yc
    WHERE yc."deletedAt" IS NULL
      AND yc."status" = 'PUBLISHED'::"YouTubeChannelStatus"
      AND (
        yc."title" ILIKE '%${term}%'
        OR yc."provider" ILIKE '%${term}%'
        OR COALESCE(yc."description", '') ILIKE '%${term}%'
        OR similarity(yc."title", '${term}') > 0.15
        OR similarity(yc."provider", '${term}') > 0.15
        OR similarity(COALESCE(yc."description", ''), '${term}') > 0.10
      )
  )
  SELECT ranked_channels.*, COUNT(*) OVER() AS "totalCount"
  FROM ranked_channels
  ORDER BY "searchRank" DESC, "subscribers" DESC, "createdAt" DESC, "id" DESC
  LIMIT 21`;

const NEW_YOUTUBE_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT
      yc."id", yc."slug", yc."title", yc."description", yc."provider",
      yc."imageUrl", yc."channelUrl", yc."subscribers", yc."views",
      yc."videoCount", yc."category", yc."status", yc."isFeatured",
      yc."providerId", yc."createdAt", yc."updatedAt", yc."deletedAt",
      (CASE
        WHEN yc."title" ILIKE '%${term}%' THEN 3
        WHEN yc."provider" ILIKE '%${term}%' THEN 2
        ELSE 1
      END)::float AS "searchRank"
    FROM "YouTubeChannel" yc
    WHERE yc."deletedAt" IS NULL
      AND yc."status" = 'PUBLISHED'::"YouTubeChannelStatus"
      AND (
        yc."title" ILIKE '%${term}%'
        OR yc."provider" ILIKE '%${term}%'
        OR COALESCE(yc."description", '') ILIKE '%${term}%'
      )
    ORDER BY "searchRank" DESC, yc."subscribers" DESC, yc."createdAt" DESC, yc."id" DESC
    LIMIT ${CANDIDATE_CAP}
  ),
  fuzzy_matches AS (
    SELECT
      yc."id", yc."slug", yc."title", yc."description", yc."provider",
      yc."imageUrl", yc."channelUrl", yc."subscribers", yc."views",
      yc."videoCount", yc."category", yc."status", yc."isFeatured",
      yc."providerId", yc."createdAt", yc."updatedAt", yc."deletedAt",
      LEAST(GREATEST(similarity(yc."title", '${term}'), similarity(yc."provider", '${term}')), 0.99) AS "searchRank"
    FROM "YouTubeChannel" yc
    WHERE yc."deletedAt" IS NULL
      AND yc."status" = 'PUBLISHED'::"YouTubeChannelStatus"
      AND yc."id" NOT IN (SELECT "id" FROM exact_matches)
      AND (yc."title" % '${term}' OR yc."provider" % '${term}')
    ORDER BY "searchRank" DESC, yc."subscribers" DESC, yc."createdAt" DESC, yc."id" DESC
    LIMIT GREATEST(${CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
  )
  SELECT * FROM exact_matches
  UNION ALL
  SELECT * FROM fuzzy_matches
  ORDER BY "searchRank" DESC, "subscribers" DESC, "createdAt" DESC, "id" DESC
  LIMIT 21`;

// ---------------------------------------------------------------------------
// Event — the old shape (and, until this fix, the shipped landing search too)
// wrapped nullable speaker/organizer/location in COALESCE(col, ''), which
// gin_trgm_ops cannot match to the plain-column index at all.
// ---------------------------------------------------------------------------

const OLD_EVENT_SEARCH = (term) => `
  WITH ranked_events AS (
    SELECT
      e.*,
      GREATEST(
        similarity(e."title", '${term}'),
        similarity(COALESCE(e."speaker", ''), '${term}'),
        similarity(COALESCE(e."organizer", ''), '${term}'),
        similarity(e."description", '${term}'),
        similarity(COALESCE(e."location", ''), '${term}')
      ) AS "searchRank"
    FROM "Event" e
    WHERE e."deletedAt" IS NULL
      AND e."status" = 'PUBLISHED'::"EventStatus"
      AND (
        e."title" ILIKE '%${term}%'
        OR COALESCE(e."speaker", '') ILIKE '%${term}%'
        OR COALESCE(e."organizer", '') ILIKE '%${term}%'
        OR e."description" ILIKE '%${term}%'
        OR COALESCE(e."location", '') ILIKE '%${term}%'
        OR e."title" % '${term}'
        OR COALESCE(e."speaker", '') % '${term}'
        OR COALESCE(e."organizer", '') % '${term}'
        OR e."description" % '${term}'
        OR COALESCE(e."location", '') % '${term}'
      )
  )
  SELECT ranked_events.*, COUNT(*) OVER() AS "totalCount"
  FROM ranked_events
  ORDER BY "searchRank" DESC, "startDate" ASC, "id" DESC
  LIMIT 21`;

const NEW_EVENT_SEARCH = (term) => `
  WITH exact_matches AS (
    SELECT
      e."id", e."slug", e."title", e."type", e."deliveryMode",
      e."category", e."status", e."imageUrl", e."speaker", e."organizer",
      e."description", e."startDate", e."endDate", e."timezone",
      e."location", e."onlineUrl", e."price", e."currency", e."isFree",
      e."pdu", e."capacity", e."attendees", e."views", e."rating",
      e."averageRating", e."ratingCount", e."registrationEnabled",
      e."providerId", e."createdAt", e."updatedAt", e."deletedAt",
      (CASE
        WHEN e."title" ILIKE '%${term}%' THEN 3
        WHEN e."speaker" ILIKE '%${term}%' THEN 2
        WHEN e."organizer" ILIKE '%${term}%' THEN 2
        WHEN e."location" ILIKE '%${term}%' THEN 2
        ELSE 1
      END)::float AS "searchRank"
    FROM "Event" e
    WHERE e."deletedAt" IS NULL
      AND e."status" = 'PUBLISHED'::"EventStatus"
      AND (
        e."title" ILIKE '%${term}%'
        OR e."speaker" ILIKE '%${term}%'
        OR e."organizer" ILIKE '%${term}%'
        OR e."location" ILIKE '%${term}%'
        OR e."description" ILIKE '%${term}%'
      )
    ORDER BY "searchRank" DESC, e."startDate" ASC, e."id" DESC
    LIMIT ${CANDIDATE_CAP}
  ),
  fuzzy_matches AS (
    SELECT
      e."id", e."slug", e."title", e."type", e."deliveryMode",
      e."category", e."status", e."imageUrl", e."speaker", e."organizer",
      e."description", e."startDate", e."endDate", e."timezone",
      e."location", e."onlineUrl", e."price", e."currency", e."isFree",
      e."pdu", e."capacity", e."attendees", e."views", e."rating",
      e."averageRating", e."ratingCount", e."registrationEnabled",
      e."providerId", e."createdAt", e."updatedAt", e."deletedAt",
      LEAST(GREATEST(
        similarity(e."title", '${term}'),
        similarity(e."speaker", '${term}'),
        similarity(e."organizer", '${term}'),
        similarity(e."location", '${term}')
      ), 0.99) AS "searchRank"
    FROM "Event" e
    WHERE e."deletedAt" IS NULL
      AND e."status" = 'PUBLISHED'::"EventStatus"
      AND e."id" NOT IN (SELECT "id" FROM exact_matches)
      AND (
        e."title" % '${term}'
        OR e."speaker" % '${term}'
        OR e."organizer" % '${term}'
        OR e."location" % '${term}'
      )
    ORDER BY "searchRank" DESC, e."startDate" ASC, e."id" DESC
    LIMIT GREATEST(${CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
  )
  SELECT * FROM exact_matches
  UNION ALL
  SELECT * FROM fuzzy_matches
  ORDER BY "searchRank" DESC, "startDate" ASC, "id" DESC
  LIMIT 21`;

const TERMS = { exact: "React", broad: "Fundamentals", typo: "Reakt" };

async function bench(label, oldSql, newSql) {
  console.log(`\n=== ${label} ===`);
  for (const [kind, term] of Object.entries(TERMS)) {
    const oldMs = await time(() => prisma.$queryRawUnsafe(oldSql(term)));
    const newMs = await time(() => prisma.$queryRawUnsafe(newSql(term)));
    console.log(
      `  ${kind.padEnd(10)} term="${term.padEnd(13)}"` +
        `  old=${oldMs.toFixed(1).padStart(9)} ms` +
        `  new=${newMs.toFixed(1).padStart(8)} ms` +
        `  speedup=${(oldMs / newMs).toFixed(1)}x`,
    );
  }
}

async function main() {
  const [courseCount, eventCount, podcastCount, channelCount] =
    await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.podcast.count({ where: { status: "PUBLISHED" } }),
      prisma.youTubeChannel.count({ where: { status: "PUBLISHED" } }),
    ]);
  console.log(
    "Published rows — Course:",
    courseCount,
    "Event:",
    eventCount,
    "Podcast:",
    podcastCount,
    "YouTubeChannel:",
    channelCount,
  );
  if (podcastCount === 0 || channelCount === 0) {
    console.log(
      "\nPodcast/YouTubeChannel are empty — run `npm run bench:landing-search --workspace api` first to seed them.",
    );
  }

  await bench("Course search", OLD_COURSE_SEARCH, NEW_COURSE_SEARCH);

  if (eventCount > 0) {
    await bench(
      "Event search (old wrapped nullable columns in COALESCE, defeating the index)",
      OLD_EVENT_SEARCH,
      NEW_EVENT_SEARCH,
    );
    const plan = await explainOf(OLD_EVENT_SEARCH(TERMS.exact));
    console.log(
      "\n  Old Event plan uses Seq Scan:",
      /Seq Scan/.test(plan),
      "| uses any Bitmap Index Scan:",
      /Bitmap Index Scan/.test(plan),
    );
    const newPlan = await explainOf(NEW_EVENT_SEARCH(TERMS.exact));
    console.log(
      "  New Event plan uses Bitmap Index Scan:",
      /Bitmap Index Scan/.test(newPlan),
      "| computes description similarity:",
      /similarity\([^)]*"description"/.test(newPlan),
    );
  }

  console.log("\n=== Course: NEW totalCount query stays cheap ===");
  for (const [kind, term] of Object.entries(TERMS)) {
    const ms = await time(() => prisma.$queryRawUnsafe(NEW_COURSE_COUNT(term)));
    console.log(`  ${kind.padEnd(10)} term="${term}"  count query: ${ms.toFixed(1)} ms`);
  }

  if (podcastCount > 0) {
    await bench(
      "Podcast search (old used non-indexable similarity() > threshold)",
      OLD_PODCAST_SEARCH,
      NEW_PODCAST_SEARCH,
    );
    const plan = await explainOf(OLD_PODCAST_SEARCH(TERMS.exact));
    console.log(
      "\n  Old Podcast plan uses Seq Scan:",
      /Seq Scan/.test(plan),
      "| uses any Bitmap Index Scan:",
      /Bitmap Index Scan/.test(plan),
    );
    const newPlan = await explainOf(NEW_PODCAST_SEARCH(TERMS.exact));
    console.log(
      "  New Podcast plan uses Bitmap Index Scan:",
      /Bitmap Index Scan/.test(newPlan),
      "| computes description similarity:",
      /similarity\([^)]*"description"/.test(newPlan),
    );
  }

  if (channelCount > 0) {
    await bench(
      "YouTube search (old used non-indexable similarity() > threshold)",
      OLD_YOUTUBE_SEARCH,
      NEW_YOUTUBE_SEARCH,
    );
    const plan = await explainOf(OLD_YOUTUBE_SEARCH(TERMS.exact));
    console.log(
      "\n  Old YouTube plan uses Seq Scan:",
      /Seq Scan/.test(plan),
      "| uses any Bitmap Index Scan:",
      /Bitmap Index Scan/.test(plan),
    );
    const newPlan = await explainOf(NEW_YOUTUBE_SEARCH(TERMS.exact));
    console.log(
      "  New YouTube plan uses Bitmap Index Scan:",
      /Bitmap Index Scan/.test(newPlan),
      "| computes description similarity:",
      /similarity\([^)]*"description"/.test(newPlan),
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
