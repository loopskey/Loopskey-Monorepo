const os = require("node:os");
const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const base = benchUrl();
guardBenchDatabase(base.toString());

const POOL = process.env.BENCH_POOL ? Number(process.env.BENCH_POOL) : null;
if (POOL) base.searchParams.set("connection_limit", String(POOL));
base.searchParams.set("pool_timeout", process.env.BENCH_POOL_TIMEOUT ?? "10");

const prisma = new PrismaClient({ datasources: { db: { url: base.toString() } } });

const defaultPool = os.cpus().length * 2 + 1;

const percentile = (sorted, p) =>
  sorted[Math.min(sorted.length - 1, Math.floor((sorted.length * p) / 100))];

const storm = async (label, concurrency, task) => {
  const latencies = [];
  const errors = new Map();
  const barrier = [];
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });

  for (let index = 0; index < concurrency; index += 1) {
    barrier.push(
      (async () => {
        await gate;
        const started = process.hrtime.bigint();
        try {
          await task(index);
          latencies.push(Number(process.hrtime.bigint() - started) / 1e6);
        } catch (error) {
          const code = error.code ?? error.constructor.name;
          errors.set(code, (errors.get(code) ?? 0) + 1);
        }
      })(),
    );
  }

  const wall = process.hrtime.bigint();
  release();
  await Promise.all(barrier);
  const totalMs = Number(process.hrtime.bigint() - wall) / 1e6;

  latencies.sort((a, b) => a - b);
  const ok = latencies.length;
  console.log(`\n  ${label}`);
  console.log(`    concurrency ${concurrency}   wall ${(totalMs / 1000).toFixed(2)}s   throughput ${(ok / (totalMs / 1000)).toFixed(0)} req/s`);
  if (ok)
    console.log(
      `    ok ${ok}   p50 ${percentile(latencies, 50).toFixed(0)}ms   p95 ${percentile(latencies, 95).toFixed(0)}ms   p99 ${percentile(latencies, 99).toFixed(0)}ms   max ${latencies[ok - 1].toFixed(0)}ms`,
    );
  if (errors.size)
    console.log(
      `    FAILURES: ${[...errors].map(([code, count]) => `${code} x${count}`).join(", ")}`,
    );
  else console.log("    FAILURES: none");
  return { label, concurrency, ok, failed: concurrency - ok, totalMs, latencies, errors };
};

async function main() {
  const poolSize = POOL ?? defaultPool;
  console.log(`CPUs: ${os.cpus().length}   Prisma pool: ${poolSize}${POOL ? " (override)" : " (default = cpus*2+1)"}`);

  const association = await prisma.association.findFirst({ select: { id: true } });
  const members = await prisma.associationMember.findMany({
    where: { associationId: association.id },
    select: { id: true },
    take: 1000,
  });
  const users = await prisma.user.findMany({
    where: { role: "PROFESSIONAL" },
    select: { id: true },
    take: 1000,
  });

  console.log("\n=== 1. Light read: 1000 users open their PDU dashboard at once ===");
  await storm("pduActivity.findMany by userId", 1000, (index) =>
    prisma.pDUActivity.findMany({
      where: { userId: users[index % users.length].id },
      orderBy: { date: "desc" },
      take: 20,
    }),
  );

  console.log("\n=== 2. Medium read: 1000 members open their compliance page at once ===");
  await storm("member compliance detail", 1000, async (index) => {
    const assignments = await prisma.associationRequirementAssignment.findMany({
      where: {
        memberId: members[index % members.length].id,
        requirement: { associationId: association.id, status: "PUBLISHED" },
      },
      select: { id: true },
    });
    return prisma.associationCreditAttribution.groupBy({
      by: ["assignmentId", "categoryId"],
      where: { assignmentId: { in: assignments.map((a) => a.id) }, state: "COUNTED" },
      _sum: { creditedAmount: true },
    });
  });

  console.log("\n=== 3. Roster search: 200 concurrent ILIKE searches ===");
  await storm("member roster search", 200, (index) =>
    prisma.associationMember.findMany({
      where: {
        associationId: association.id,
        OR: [
          { memberNumber: { contains: `User ${index}`, mode: "insensitive" } },
          { user: { fullName: { contains: `User ${index}`, mode: "insensitive" } } },
          { user: { email: { contains: `User ${index}`, mode: "insensitive" } } },
        ],
      },
      take: 21,
      orderBy: [{ invitedAt: "desc" }, { id: "desc" }],
      select: { id: true },
    }),
  );

  console.log("\n=== 4. Heavy read: 10 association admins open the compliance report at once ===");
  await storm("full report projection", 10, async () => {
    const roster = await prisma.associationMember.findMany({
      where: { associationId: association.id, status: { not: "INACTIVE" } },
      select: { id: true, userId: true, memberNumber: true, status: true },
      orderBy: { invitedAt: "asc" },
    });
    const assignments = await prisma.associationRequirementAssignment.findMany({
      where: {
        memberId: { in: roster.map((m) => m.id) },
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
    return prisma.associationCreditAttribution.groupBy({
      by: ["assignmentId", "categoryId", "state"],
      where: {
        assignmentId: { in: assignments.map((a) => a.id) },
        activityDate: { lte: new Date() },
        state: { in: ["COUNTED", "AWAITING_REVIEW"] },
      },
      _sum: { creditedAmount: true },
      _count: { _all: true },
    });
  });

  console.log("\n=== 5. Write path: requirement materialisation (sequential upsert loop) ===");
  const requirement = await prisma.associationRequirement.findFirst({
    where: { associationId: association.id },
    select: { id: true, deadline: true },
  });
  const cycleStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
  const BATCH = 200;
  const targets = members.slice(0, 1000).map((m) => m.id);
  const writeStarted = process.hrtime.bigint();
  for (let index = 0; index < targets.length; index += BATCH) {
    const batch = targets.slice(index, index + BATCH);
    await prisma.$transaction(async (tx) => {
      for (const memberId of batch) {
        await tx.associationRequirementAssignment.upsert({
          where: {
            requirementId_memberId_cycleStart: {
              requirementId: requirement.id,
              memberId,
              cycleStart,
            },
          },
          create: {
            requirementId: requirement.id, memberId, cycleStart,
            dueDate: requirement.deadline, isTargeted: true,
          },
          update: { isTargeted: true, dueDate: requirement.deadline },
        });
      }
    });
  }
  const writeMs = Number(process.hrtime.bigint() - writeStarted) / 1e6;
  console.log(
    `\n    ${targets.length} members materialised in ${(writeMs / 1000).toFixed(2)}s  ` +
    `(${(writeMs / targets.length).toFixed(2)}ms per member, ${(targets.length / (writeMs / 1000)).toFixed(0)} upserts/s)`,
  );
  console.log(`    transaction timeout is 15s; a batch of ${BATCH} took ~${((writeMs / targets.length) * BATCH / 1000).toFixed(2)}s`);

  console.log("\n=== 6. Outbox drain rate ===");
  const pending = await prisma.outboxEvent.count({ where: { processedAt: null } });
  const claimStarted = process.hrtime.bigint();
  for (let index = 0; index < 20; index += 1) {
    await prisma.$queryRawUnsafe(`
      SELECT "id" FROM "OutboxEvent"
      WHERE "processedAt" IS NULL AND "availableAt" <= now() AND "attemptCount" < 10
      ORDER BY "occurredAt" ASC LIMIT 1`);
  }
  const claimMs = Number(process.hrtime.bigint() - claimStarted) / 1e6 / 20;
  console.log(`    unprocessed events: ${pending}`);
  console.log(`    claim query: ${claimMs.toFixed(1)}ms`);
  console.log(`    processor polls every 1000ms and takes LIMIT 1 -> ceiling is 1 event/s/instance`);
  console.log(`    draining ${pending} events at that ceiling: ${(pending / 60).toFixed(0)} minutes`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
