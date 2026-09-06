const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const RUNS = Number(process.env.BENCH_RUNS ?? 7);
const TERMS = ["User 7742", "User 31500", "bench88123@", "User 62001"];

const time = async (fn) => {
  await fn();
  const samples = [];
  for (let run = 0; run < RUNS; run += 1) {
    const started = process.hrtime.bigint();
    await fn();
    samples.push(Number(process.hrtime.bigint() - started) / 1e6);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
};

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const currentShape = (associationId, term) =>
  prisma.associationMember.findMany({
    where: {
      associationId,
      OR: [
        { memberNumber: { contains: term, mode: "insensitive" } },
        { user: { fullName: { contains: term, mode: "insensitive" } } },
        { user: { email: { contains: term, mode: "insensitive" } } },
      ],
    },
    take: 21,
    orderBy: [{ invitedAt: "desc" }, { id: "desc" }],
    select: { id: true },
  });

const unionShape = (associationId, term) =>
  prisma.$queryRawUnsafe(`
    WITH matched_users AS (
      SELECT id FROM "User" WHERE "fullName" ILIKE '%${term}%'
      UNION
      SELECT id FROM "User" WHERE email ILIKE '%${term}%'
    )
    SELECT m.id FROM "AssociationMember" m
    WHERE m."associationId" = '${associationId}'
      AND (m."userId" IN (SELECT id FROM matched_users)
           OR m."memberNumber" ILIKE '%${term}%')
    ORDER BY m."invitedAt" DESC, m.id DESC
    LIMIT 21`);

const explainOf = async (sql) =>
  (await prisma.$queryRawUnsafe(`EXPLAIN (ANALYZE) ${sql}`))
    .map((row) => row["QUERY PLAN"])
    .join("\n");

const dropIndexes = () =>
  Promise.all([
    prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "User_fullName_trgm_idx"`),
    prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "User_email_trgm_idx"`),
  ]);

const createIndexes = async () => {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "User_fullName_trgm_idx" ON "User" USING GIN ("fullName" gin_trgm_ops)`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "User_email_trgm_idx" ON "User" USING GIN (email gin_trgm_ops)`,
  );
  await prisma.$executeRawUnsafe(`ANALYZE "User"`);
};

const sweepBoth = async (associationId) => ({
  current: median(await Promise.all(TERMS.map((term) => time(() => currentShape(associationId, term))))),
  union: median(await Promise.all(TERMS.map((term) => time(() => unionShape(associationId, term))))),
});

async function main() {
  const association = await prisma.association.findFirst({ select: { id: true } });
  const users = await prisma.user.count();
  console.log(`\nUser rows: ${users}\n`);

  await dropIndexes();
  await prisma.$executeRawUnsafe(`ANALYZE "User"`);
  const withoutIndex = await sweepBoth(association.id);

  await createIndexes();
  const withIndex = await sweepBoth(association.id);

  console.log("=== single-table ILIKE control: does the GIN index work at all? ===");
  await dropIndexes();
  await prisma.$executeRawUnsafe(`ANALYZE "User"`);
  const plainNo = await time(() =>
    prisma.$queryRawUnsafe(`SELECT id FROM "User" WHERE "fullName" ILIKE '%User 7742%' LIMIT 21`),
  );
  await createIndexes();
  const plainYes = await time(() =>
    prisma.$queryRawUnsafe(`SELECT id FROM "User" WHERE "fullName" ILIKE '%User 7742%' LIMIT 21`),
  );
  console.log(`  SELECT ... WHERE "fullName" ILIKE '%x%'`);
  console.log(`    without GIN: ${plainNo.toFixed(1)} ms`);
  console.log(`    with GIN:    ${plainYes.toFixed(1)} ms   -> ${(plainNo / plainYes).toFixed(1)}x`);
  console.log(
    (await explainOf(`SELECT id FROM "User" WHERE "fullName" ILIKE '%User 7742%' LIMIT 21`))
      .split("\n").slice(0, 4).map((line) => "    " + line).join("\n"),
  );

  console.log("\n=== the association roster search, four ways ===");
  console.table([
    {
      "query shape": "OR across the User join (ships today)",
      "no GIN": `${withoutIndex.current.toFixed(0)} ms`,
      "with GIN": `${withIndex.current.toFixed(0)} ms`,
      "GIN helps?": withoutIndex.current / withIndex.current > 1.3 ? "yes" : "NO",
    },
    {
      "query shape": "UNION of per-column lookups, then join",
      "no GIN": `${withoutIndex.union.toFixed(0)} ms`,
      "with GIN": `${withIndex.union.toFixed(0)} ms`,
      "GIN helps?": withoutIndex.union / withIndex.union > 1.3 ? "yes" : "NO",
    },
  ]);

  console.log("\n  plan for the UNION rewrite with the GIN index in place:");
  console.log(
    (await explainOf(`
      WITH matched_users AS (
        SELECT id FROM "User" WHERE "fullName" ILIKE '%User 7742%'
        UNION
        SELECT id FROM "User" WHERE email ILIKE '%User 7742%'
      )
      SELECT m.id FROM "AssociationMember" m
      WHERE m."associationId" = '${association.id}'
        AND (m."userId" IN (SELECT id FROM matched_users)
             OR m."memberNumber" ILIKE '%User 7742%')
      ORDER BY m."invitedAt" DESC, m.id DESC LIMIT 21`))
      .split("\n").map((line) => "    " + line).join("\n"),
  );

  const best = withIndex.union;
  const now = withoutIndex.current;
  console.log(
    `\n  today ${now.toFixed(0)} ms  ->  rewrite + index ${best.toFixed(0)} ms  =  ${(now / best).toFixed(1)}x faster`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
