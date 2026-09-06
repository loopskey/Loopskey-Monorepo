const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const RUNS = Number(process.env.BENCH_RUNS ?? 5);

const results = [];

const measure = async (name, source, fn) => {
  await fn();
  const samples = [];
  for (let run = 0; run < RUNS; run += 1) {
    const started = process.hrtime.bigint();
    await fn();
    samples.push(Number(process.hrtime.bigint() - started) / 1e6);
  }
  samples.sort((a, b) => a - b);
  const record = {
    query: name,
    source,
    p50: +samples[Math.floor(samples.length / 2)].toFixed(1),
    max: +samples[samples.length - 1].toFixed(1),
  };
  results.push(record);
  console.log(
    `  ${record.p50.toFixed(1).padStart(9)} ms  p50   ${String(record.max).padStart(9)} ms max   ${name}`,
  );
  return record;
};

const explain = async (label, sql) => {
  const rows = await prisma.$queryRawUnsafe(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${sql}`,
  );
  const plan = rows.map((row) => row["QUERY PLAN"]).join("\n");
  console.log(`\n--- EXPLAIN: ${label} ---\n${plan}\n`);
};

async function main() {
  const association = await prisma.association.findFirst({ select: { id: true } });
  const member = await prisma.associationMember.findFirst({
    where: { associationId: association.id },
    select: { id: true, userId: true },
  });
  const user = await prisma.user.findFirst({
    where: { role: "PROFESSIONAL" },
    select: { id: true },
  });

  console.log("\n=== READ PATHS (each measured over " + RUNS + " runs) ===\n");

  await measure(
    "association member roster, page 1 (no search)",
    "association-member.service.ts:109",
    () =>
      prisma.associationMember.findMany({
        where: { associationId: association.id },
        take: 21,
        orderBy: [{ invitedAt: "desc" }, { id: "desc" }],
        select: { id: true, userId: true, memberNumber: true, status: true, invitedAt: true },
      }),
  );

  await measure(
    "association member roster, totalCount",
    "association-member.service.ts:121",
    () => prisma.associationMember.count({ where: { associationId: association.id } }),
  );

  await measure(
    "association member roster, search 'User 77' (ILIKE on relation)",
    "association-member.service.ts:99-107",
    () =>
      prisma.associationMember.findMany({
        where: {
          associationId: association.id,
          OR: [
            { memberNumber: { contains: "User 77", mode: "insensitive" } },
            { user: { fullName: { contains: "User 77", mode: "insensitive" } } },
            { user: { email: { contains: "User 77", mode: "insensitive" } } },
          ],
        },
        take: 21,
        orderBy: [{ invitedAt: "desc" }, { id: "desc" }],
        select: { id: true, memberNumber: true },
      }),
  );

  await measure(
    "association member roster, search totalCount (ILIKE count)",
    "association-member.service.ts:121 with search",
    () =>
      prisma.associationMember.count({
        where: {
          associationId: association.id,
          OR: [
            { memberNumber: { contains: "User 77", mode: "insensitive" } },
            { user: { fullName: { contains: "User 77", mode: "insensitive" } } },
            { user: { email: { contains: "User 77", mode: "insensitive" } } },
          ],
        },
      }),
  );

  await measure(
    "member compliance detail (one member)",
    "association-compliance-read.service.ts:60",
    async () => {
      const assignments = await prisma.associationRequirementAssignment.findMany({
        where: {
          memberId: member.id,
          requirement: { associationId: association.id, status: "PUBLISHED" },
        },
        include: { requirement: { select: { id: true, name: true, categories: true } } },
        orderBy: { dueDate: "asc" },
      });
      return prisma.associationCreditAttribution.groupBy({
        by: ["assignmentId", "categoryId"],
        where: {
          assignmentId: { in: assignments.map((a) => a.id) },
          state: "COUNTED",
        },
        _sum: { creditedAmount: true },
      });
    },
  );

  await measure(
    "FULL association report projection (every member, every assignment)",
    "association-report.service.ts:546-610",
    async () => {
      const members = await prisma.associationMember.findMany({
        where: { associationId: association.id, status: { not: "INACTIVE" } },
        select: { id: true, userId: true, memberNumber: true, status: true, groupId: true },
        orderBy: { invitedAt: "asc" },
      });
      const assignments = await prisma.associationRequirementAssignment.findMany({
        where: {
          memberId: { in: members.map((m) => m.id) },
          requirement: { associationId: association.id, status: "PUBLISHED" },
        },
        select: {
          id: true, memberId: true, dueDate: true, computedAt: true,
          requirement: {
            select: {
              id: true, name: true, totalRequiredCredits: true,
              categories: { select: { id: true, name: true, requiredCredits: true, order: true } },
            },
          },
        },
      });
      const credits = await prisma.associationCreditAttribution.groupBy({
        by: ["assignmentId", "categoryId", "state"],
        where: {
          assignmentId: { in: assignments.map((a) => a.id) },
          activityDate: { lte: new Date() },
          state: { in: ["COUNTED", "AWAITING_REVIEW"] },
        },
        _sum: { creditedAmount: true },
        _count: { _all: true },
      });
      return { members: members.length, assignments: assignments.length, credits: credits.length };
    },
  );

  await measure(
    "professional PDU dashboard (targets + activities + groupBy)",
    "professional-pdu.service.ts:93-110",
    () =>
      Promise.all([
        prisma.pDUActivity.findMany({
          where: { userId: user.id },
          orderBy: { date: "desc" },
        }),
        prisma.pDUActivity.groupBy({
          by: ["category"],
          where: { userId: user.id },
          _sum: { pdus: true },
        }),
      ]),
  );

  await measure(
    "outbox claim (FOR UPDATE SKIP LOCKED over 50k events)",
    "outbox-processor.service.ts:89",
    () =>
      prisma.$queryRawUnsafe(`
        SELECT "id" FROM "OutboxEvent"
        WHERE "processedAt" IS NULL AND "availableAt" <= now() AND "attemptCount" < 10
        ORDER BY "occurredAt" ASC LIMIT 1`),
  );

  await measure(
    "audit log page 1 (200k rows)",
    "admin audit listing",
    () =>
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
  );

  console.log("\n=== PLANS FOR THE THREE WORST ===");

  await explain(
    "member roster search (ILIKE across the User join)",
    `SELECT m.id FROM "AssociationMember" m
     LEFT JOIN "User" u ON u.id = m."userId"
     WHERE m."associationId" = '${association.id}'
       AND (m."memberNumber" ILIKE '%User 77%'
            OR u."fullName" ILIKE '%User 77%'
            OR u.email ILIKE '%User 77%')
     ORDER BY m."invitedAt" DESC, m.id DESC LIMIT 21`,
  );

  await explain(
    "report projection credit rollup",
    `SELECT a."assignmentId", a."categoryId", a.state,
            sum(a."creditedAmount"), count(*)
     FROM "AssociationCreditAttribution" a
     JOIN "AssociationRequirementAssignment" asg ON asg.id = a."assignmentId"
     JOIN "AssociationRequirement" r ON r.id = asg."requirementId"
     WHERE r."associationId" = '${association.id}'
       AND a."activityDate" <= now()
       AND a.state IN ('COUNTED','AWAITING_REVIEW')
     GROUP BY 1,2,3`,
  );

  await explain(
    "outbox claim",
    `SELECT "id" FROM "OutboxEvent"
     WHERE "processedAt" IS NULL AND "availableAt" <= now() AND "attemptCount" < 10
     ORDER BY "occurredAt" ASC LIMIT 1`,
  );

  console.log("\n=== SUMMARY ===");
  console.table(results);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
