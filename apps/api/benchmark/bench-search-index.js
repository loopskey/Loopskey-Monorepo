const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const TARGET_USERS = Number(process.env.BENCH_SEARCH_USERS ?? 100000);
const RUNS = Number(process.env.BENCH_RUNS ?? 5);
const TERMS = ["User 7742", "Bench User 31", "bench88123@", "User 999", "Bench"];

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

const explainOf = async (sql) => {
  const rows = await prisma.$queryRawUnsafe(`EXPLAIN (ANALYZE) ${sql}`);
  return rows.map((row) => row["QUERY PLAN"]).join("\n");
};

const associationSearch = (associationId, term) =>
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

const catalogueStyleSearch = (term) =>
  prisma.$queryRawUnsafe(`
    SELECT id, GREATEST(similarity("fullName", '${term}'),
                        similarity(email, '${term}')) AS rank
    FROM "User"
    WHERE "fullName" ILIKE '%${term}%'
       OR email ILIKE '%${term}%'
       OR "fullName" % '${term}'
       OR email % '${term}'
    ORDER BY rank DESC LIMIT 21`);

const sweep = async (associationId, label) => {
  const association = [];
  const catalogue = [];
  for (const term of TERMS) {
    association.push(await time(() => associationSearch(associationId, term)));
    catalogue.push(await time(() => catalogueStyleSearch(term)));
  }
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  console.log(
    `  ${label.padEnd(22)}  association ILIKE ${median(association).toFixed(0).padStart(6)} ms` +
    `   catalogue similarity() ${median(catalogue).toFixed(0).padStart(6)} ms`,
  );
  return { association: median(association), catalogue: median(catalogue) };
};

async function main() {
  const association = await prisma.association.findFirst({ select: { id: true } });

  const existing = await prisma.user.count();
  if (existing < TARGET_USERS) {
    process.stdout.write(`growing User from ${existing} to ${TARGET_USERS} ... `);
    const started = Date.now();
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, email, "fullName", "firstName", "lastName",
                          role, status, "createdAt", "updatedAt")
      SELECT 'bulk_' || lpad(g::text, 9, '0'),
             'bench' || g || '@loopskey.test',
             'Bench User ' || g, 'Bench', 'User ' || g,
             'PROFESSIONAL'::"Role", 'ACTIVE'::"UserStatus", now(), now()
      FROM generate_series(${existing + 1}, ${TARGET_USERS}) g
      ON CONFLICT DO NOTHING`);
    await prisma.$executeRawUnsafe(`ANALYZE "User"`);
    console.log(`${((Date.now() - started) / 1000).toFixed(1)}s`);
  }

  console.log(`\nUser rows: ${await prisma.user.count()}   association members: ${await prisma.associationMember.count({ where: { associationId: association.id } })}`);

  console.log("\n=== WITHOUT trigram indexes (what the Association module ships today) ===");
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "User_fullName_trgm_idx"`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "User_email_trgm_idx"`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "AssociationMember_memberNumber_trgm_idx"`);
  const before = await sweep(association.id, "no index");

  console.log("\n  plan for the association roster search:");
  console.log(
    (await explainOf(`
      SELECT m.id FROM "AssociationMember" m
      LEFT JOIN "User" u ON u.id = m."userId"
      WHERE m."associationId" = '${association.id}'
        AND (m."memberNumber" ILIKE '%User 7742%'
             OR u."fullName" ILIKE '%User 7742%'
             OR u.email ILIKE '%User 7742%')
      ORDER BY m."invitedAt" DESC, m.id DESC LIMIT 21`))
      .split("\n").map((line) => "    " + line).join("\n"),
  );

  console.log("\n=== building the trigram indexes the rest of the platform uses ===");
  const buildStarted = Date.now();
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX "User_fullName_trgm_idx" ON "User" USING GIN ("fullName" gin_trgm_ops)`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX "User_email_trgm_idx" ON "User" USING GIN (email gin_trgm_ops)`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX "AssociationMember_memberNumber_trgm_idx" ON "AssociationMember" USING GIN ("memberNumber" gin_trgm_ops)`,
  );
  await prisma.$executeRawUnsafe(`ANALYZE "User"`);
  await prisma.$executeRawUnsafe(`ANALYZE "AssociationMember"`);
  console.log(`  built in ${((Date.now() - buildStarted) / 1000).toFixed(1)}s`);

  console.log("\n=== WITH trigram indexes ===");
  const after = await sweep(association.id, "gin_trgm_ops");

  console.log("\n  plan for the association roster search:");
  console.log(
    (await explainOf(`
      SELECT m.id FROM "AssociationMember" m
      LEFT JOIN "User" u ON u.id = m."userId"
      WHERE m."associationId" = '${association.id}'
        AND (m."memberNumber" ILIKE '%User 7742%'
             OR u."fullName" ILIKE '%User 7742%'
             OR u.email ILIKE '%User 7742%')
      ORDER BY m."invitedAt" DESC, m.id DESC LIMIT 21`))
      .split("\n").map((line) => "    " + line).join("\n"),
  );

  const delta = (a, b) => (a === 0 ? "n/a" : `${(a / b).toFixed(1)}x`);
  console.log("\n=== VERDICT ===");
  console.table([
    {
      "search style": "association roster (Prisma contains, OR across a join)",
      "no index": `${before.association.toFixed(0)} ms`,
      "with GIN": `${after.association.toFixed(0)} ms`,
      speedup: delta(before.association, after.association),
    },
    {
      "search style": "catalogue style (similarity + % on one table)",
      "no index": `${before.catalogue.toFixed(0)} ms`,
      "with GIN": `${after.catalogue.toFixed(0)} ms`,
      speedup: delta(before.catalogue, after.catalogue),
    },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
