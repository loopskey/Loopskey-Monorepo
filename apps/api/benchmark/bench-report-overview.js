const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const MONTHS_IN_WINDOW = Number(process.env.BENCH_TREND_MONTHS ?? 12);

let projectionCount = 0;

const projectAt = async (associationId, at) => {
  projectionCount += 1;
  const members = await prisma.associationMember.findMany({
    where: { associationId, status: { not: "INACTIVE" } },
    select: { id: true, userId: true, memberNumber: true, status: true, groupId: true },
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
          categories: { select: { id: true, name: true, requiredCredits: true, order: true } },
        },
      },
    },
  });
  const credits = await prisma.associationCreditAttribution.groupBy({
    by: ["assignmentId", "categoryId", "state"],
    where: {
      assignmentId: { in: assignments.map((a) => a.id) },
      activityDate: { lte: at },
      state: { in: ["COUNTED", "AWAITING_REVIEW"] },
    },
    _sum: { creditedAmount: true },
    _count: { _all: true },
  });
  return { members, assignments, credits };
};

const monthEnds = (count) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (count - 1 - index));
    return date;
  });

async function main() {
  const association = await prisma.association.findFirst({ select: { id: true } });
  const memberCount = await prisma.associationMember.count({
    where: { associationId: association.id },
  });
  const now = new Date();
  const previous = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  console.log(`\nAssociation with ${memberCount} members, trend window ${MONTHS_IN_WINDOW} months`);
  console.log("Replaying the AssociationReportsOverview document (5 root fields).\n");

  const started = process.hrtime.bigint();

  const [summary, byGroup, byCategory, distribution, trend] = await Promise.all([
    (async () => {
      const current = await projectAt(association.id, now);
      const prior = await projectAt(association.id, previous);
      return { current: current.members.length, prior: prior.members.length };
    })(),
    projectAt(association.id, now),
    projectAt(association.id, now),
    projectAt(association.id, now),
    (async () => {
      await projectAt(association.id, now);
      const points = [];
      for (const at of monthEnds(MONTHS_IN_WINDOW)) {
        const projection = await projectAt(association.id, at);
        points.push(projection.members.length);
      }
      return points;
    })(),
  ]);

  const elapsed = Number(process.hrtime.bigint() - started) / 1e6;

  console.log(`  associationReportSummary       -> ${summary.current} members (2 projections)`);
  console.log(`  associationComplianceByGroup   -> ${byGroup.members.length} members (1 projection)`);
  console.log(`  associationProgressByCategory  -> ${byCategory.members.length} members (1 projection)`);
  console.log(`  associationMemberDistribution  -> ${distribution.members.length} members (1 projection)`);
  console.log(`  associationComplianceTrend     -> ${trend.length} points (${1 + MONTHS_IN_WINDOW} projections)`);
  console.log(`\n  TOTAL PROJECTIONS: ${projectionCount}`);
  console.log(`  WALL TIME:         ${(elapsed / 1000).toFixed(1)}s   for ONE page load, ONE admin`);
  console.log(
    `\n  Per-member cost: ${(elapsed / memberCount).toFixed(1)}ms  ->  ` +
    `a 5,000-member association would take ~${((elapsed / memberCount) * 5000 / 1000).toFixed(0)}s`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
