const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " MB";

const projectAt = async (associationId) => {
  const members = await prisma.associationMember.findMany({
    where: { associationId, status: { not: "INACTIVE" } },
    select: {
      id: true, userId: true, memberNumber: true, status: true, groupId: true,
      user: { select: { fullName: true, email: true } },
    },
    orderBy: { invitedAt: "asc" },
  });
  const assignments = await prisma.associationRequirementAssignment.findMany({
    where: {
      memberId: { in: members.map((m) => m.id) },
      requirement: { associationId, status: "PUBLISHED" },
    },
    select: {
      id: true, memberId: true, dueDate: true, computedAt: true,
      requirement: {
        select: {
          id: true, name: true, totalRequiredCredits: true,
          categories: { select: { id: true, name: true, mappedCategory: true, requiredCredits: true, order: true } },
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
  return { members, assignments, credits };
};

async function main() {
  const association = await prisma.association.findFirst({ select: { id: true } });
  const memberCount = await prisma.associationMember.count({
    where: { associationId: association.id },
  });

  global.gc?.();
  const before = process.memoryUsage();
  const started = process.hrtime.bigint();
  const projection = await projectAt(association.id);
  const elapsed = Number(process.hrtime.bigint() - started) / 1e6;
  const after = process.memoryUsage();

  console.log(`\nAssociation members: ${memberCount}`);
  console.log(`Projection built in ${(elapsed / 1000).toFixed(2)}s`);
  console.log(`  members loaded      : ${projection.members.length}`);
  console.log(`  assignments loaded  : ${projection.assignments.length}`);
  console.log(`  credit groups loaded: ${projection.credits.length}`);
  console.log(`\nHeap used before: ${mb(before.heapUsed)}`);
  console.log(`Heap used after : ${mb(after.heapUsed)}`);
  console.log(`Delta           : ${mb(after.heapUsed - before.heapUsed)}`);
  console.log(`RSS             : ${mb(after.rss)}`);

  const perMember = (after.heapUsed - before.heapUsed) / projection.members.length;
  console.log(`\nHeap per member : ${(perMember / 1024).toFixed(1)} KB`);
  for (const size of [1000, 5000, 20000, 50000]) {
    console.log(
      `  projected heap for a ${String(size).padStart(5)}-member association: ${mb(perMember * size)}` +
      `   (${((elapsed / projection.members.length) * size / 1000).toFixed(1)}s)`,
    );
  }
  console.log(
    `\nNode default old-space is ~1.5-4 GB depending on the container memory limit.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
