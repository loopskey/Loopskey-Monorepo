const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

const SCALE = {
  users: Number(process.env.BENCH_USERS ?? 1000),
  associations: Number(process.env.BENCH_ASSOCIATIONS ?? 5),
  requirementsPerAssociation: Number(process.env.BENCH_REQUIREMENTS ?? 6),
  categoriesPerRequirement: Number(process.env.BENCH_CATEGORIES ?? 4),
  pduActivitiesPerUser: Number(process.env.BENCH_PDU_PER_USER ?? 120),
  attributionsPerAssignment: Number(process.env.BENCH_ATTR_PER_ASSIGNMENT ?? 30),
  auditLogs: Number(process.env.BENCH_AUDIT_LOGS ?? 200000),
  outboxEvents: Number(process.env.BENCH_OUTBOX ?? 50000),
};

const url = benchUrl().toString();
guardBenchDatabase(url);

const prisma = new PrismaClient({ datasources: { db: { url } } });

const step = async (label, fn) => {
  const started = Date.now();
  process.stdout.write("  " + label + " ... ");
  const result = await fn();
  console.log(((Date.now() - started) / 1000).toFixed(1) + "s");
  return result;
};

const run = (text) => prisma.$executeRawUnsafe(text);

async function main() {
  console.log("Seeding benchmark database (users=" + SCALE.users + ")\n");

  await step("truncate", () =>
    run(`TRUNCATE TABLE
        "AssociationCreditAttribution","AssociationRequirementAssignment",
        "AssociationRequirementCategory","AssociationRequirementTarget",
        "AssociationRequirement","AssociationMember","AssociationGroup",
        "AssociationSettings","Association","PDUActivity","AuditLog",
        "OutboxDelivery","OutboxEvent","User"
      RESTART IDENTITY CASCADE`),
  );

  await step("users (" + SCALE.users + ")", () =>
    run(`INSERT INTO "User" (id, email, "fullName", "firstName", "lastName", "passwordHash",
                        role, status, "createdAt", "updatedAt")
    SELECT 'usr_' || lpad(g::text, 9, '0'),
           'bench' || g || '@loopskey.test',
           'Bench User ' || g, 'Bench', 'User ' || g,
           'argon2-placeholder-not-a-real-hash',
           CASE WHEN g <= ${SCALE.associations} THEN 'ASSOCIATION'::"Role" ELSE 'PROFESSIONAL'::"Role" END,
           'ACTIVE'::"UserStatus",
           now() - (g || ' minutes')::interval, now()
    FROM generate_series(1, ${SCALE.users}) g`),
  );

  await step("associations (" + SCALE.associations + ")", () =>
    run(`INSERT INTO "Association" (id, "ownerId", name, country, "createdAt", "updatedAt")
    SELECT 'asc_' || lpad(g::text, 6, '0'), 'usr_' || lpad(g::text, 9, '0'),
           'Bench Association ' || g, 'CA', now(), now()
    FROM generate_series(1, ${SCALE.associations}) g`),
  );

  await step("association settings", () =>
    run(`INSERT INTO "AssociationSettings" (id, "associationId", "createdAt", "updatedAt")
    SELECT 'ast_' || lpad(g::text, 6, '0'), 'asc_' || lpad(g::text, 6, '0'), now(), now()
    FROM generate_series(1, ${SCALE.associations}) g`),
  );

  const memberCount = await step("members", async () => {
    await run(`INSERT INTO "AssociationMember" (id, "associationId", "userId", status, "memberNumber",
                                       "invitedAt", "activatedAt", "createdAt", "updatedAt")
      SELECT 'mbr_' || lpad(a::text,4,'0') || '_' || lpad(u::text,9,'0'),
             'asc_' || lpad(a::text, 6, '0'),
             'usr_' || lpad(u::text, 9, '0'),
             'ACTIVE'::"AssociationMemberStatus",
             'M-' || a || '-' || u,
             now() - (u || ' minutes')::interval, now(), now(), now()
      FROM generate_series(1, ${SCALE.associations}) a,
           generate_series(${SCALE.associations + 1}, ${SCALE.users}) u`);
    return prisma.associationMember.count();
  });

  await step("requirements", () =>
    run(`INSERT INTO "AssociationRequirement" (id, "associationId", "createdById", name,
      "creditType", "totalRequiredCredits", deadline, "reportingCycle", "evidencePolicy",
      "audienceKind", status, "publishedAt", "createdAt", "updatedAt")
    SELECT 'req_' || lpad(a::text,4,'0') || '_' || lpad(r::text,4,'0'),
           'asc_' || lpad(a::text, 6, '0'), 'usr_' || lpad(a::text, 9, '0'),
           'Requirement ' || a || '-' || r, 'CPD'::"CreditType", 40,
           now() + ((r * 30) || ' days')::interval,
           'ANNUAL'::"AssociationReportingCycle",
           'REQUIRED_NEEDS_REVIEW'::"AssociationEvidencePolicy",
           'ALL_MEMBERS'::"AssociationAudienceKind",
           'PUBLISHED'::"AssociationRequirementStatus", now(), now(), now()
    FROM generate_series(1, ${SCALE.associations}) a,
         generate_series(1, ${SCALE.requirementsPerAssociation}) r`),
  );

  await step("requirement categories", () =>
    run(`INSERT INTO "AssociationRequirementCategory" (id, "requirementId", name,
      "mappedCategory", "requiredCredits", "order")
    SELECT 'rqc_' || lpad(a::text,4,'0') || '_' || lpad(r::text,4,'0') || '_' || c,
           'req_' || lpad(a::text,4,'0') || '_' || lpad(r::text,4,'0'),
           'Category ' || c,
           (ARRAY['TECHNICAL','LEADERSHIP','STRATEGIC','ETHICS','BUSINESS',
                  'COMPLIANCE','COMMUNICATION','OTHER'])[c]::"PDUCategory",
           10, c
    FROM generate_series(1, ${SCALE.associations}) a,
         generate_series(1, ${SCALE.requirementsPerAssociation}) r,
         generate_series(1, ${SCALE.categoriesPerRequirement}) c`),
  );

  const assignmentCount = await step("requirement assignments", async () => {
    await run(`INSERT INTO "AssociationRequirementAssignment" (id, "requirementId", "memberId",
        "cycleStart", "cycleEnd", "dueDate", "isTargeted", "recordedCredits",
        "completedCredits", percent, band, "awaitingReviewCount", "isMissingEvidence",
        "computedAt", "assignedAt", "updatedAt")
      SELECT 'asg_' || substr(md5(m.id || rq.id), 1, 24),
             rq.id, m.id,
             date_trunc('year', now()), date_trunc('year', now()) + interval '1 year',
             rq.deadline, true, 0, 0, 0, 'NOT_STARTED'::"AssociationComplianceBand",
             0, false, now(), now(), now()
      FROM "AssociationMember" m
      JOIN "AssociationRequirement" rq ON rq."associationId" = m."associationId"`);
    return prisma.associationRequirementAssignment.count();
  });

  const attributionCount = await step("credit attributions", async () => {
    await run(`INSERT INTO "AssociationCreditAttribution" (id, "assignmentId", "activityId",
        "categoryId", "creditedAmount", "activityDate", "isLate", state,
        "createdAt", "updatedAt")
      SELECT 'atr_' || substr(md5(asg.id || n::text), 1, 24),
             asg.id, 'act_' || substr(md5(asg.id || n::text), 1, 20),
             cat.id, 1.5, now() - ((n * 3) || ' days')::interval, false,
             CASE WHEN n % 7 = 0 THEN 'AWAITING_REVIEW'::"AssociationAttributionState"
                  ELSE 'COUNTED'::"AssociationAttributionState" END,
             now(), now()
      FROM "AssociationRequirementAssignment" asg
      CROSS JOIN generate_series(1, ${SCALE.attributionsPerAssignment}) n
      LEFT JOIN (
        SELECT "requirementId", id,
               row_number() OVER (PARTITION BY "requirementId" ORDER BY "order") - 1 AS slot
        FROM "AssociationRequirementCategory"
      ) cat
        ON cat."requirementId" = asg."requirementId"
       AND cat.slot = (n % ${SCALE.categoriesPerRequirement})`);
    return prisma.associationCreditAttribution.count();
  });

  await step("pdu activities", () =>
    run(`INSERT INTO "PDUActivity" (id, "userId", title, category, pdus, date,
      "reportingYear", status, "completionStatus", "createdAt", "updatedAt")
    SELECT 'pdu_' || lpad(u::text,9,'0') || '_' || lpad(n::text,5,'0'),
           'usr_' || lpad(u::text, 9, '0'),
           'Activity ' || u || '-' || n,
           'TECHNICAL'::"PDUCategory", 1.5,
           now() - ((n * 5) || ' days')::interval,
           extract(year from now() - ((n * 5) || ' days')::interval)::int,
           'APPROVED'::"PDUStatus", 'COMPLETED'::"PDUCompletionStatus", now(), now()
    FROM generate_series(1, ${SCALE.users}) u,
         generate_series(1, ${SCALE.pduActivitiesPerUser}) n`),
  );

  await step("audit logs", () =>
    run(`INSERT INTO "AuditLog" (id, "actorId", action, "entityType", "entityId", "createdAt")
    SELECT 'aud_' || lpad(g::text, 10, '0'),
           'usr_' || lpad(((g % ${SCALE.users}) + 1)::text, 9, '0'),
           'ASSOCIATION_ACTIVITY_APPROVED'::"AuditAction", 'AssociationMember',
           'mbr_0001_' || lpad(((g % ${SCALE.users}) + 1)::text, 9, '0'),
           now() - ((g % 500000) || ' seconds')::interval
    FROM generate_series(1, ${SCALE.auditLogs}) g`),
  );

  await step("outbox events", () =>
    run(`INSERT INTO "OutboxEvent" (id, "eventName", "eventVersion", "aggregateType",
      "aggregateId", payload, "occurredAt", "availableAt", "processedAt", "attemptCount")
    SELECT 'obx_' || lpad(g::text, 10, '0'), 'association.member.invited', 1,
           'AssociationMember', 'mbr_0001_' || lpad(((g % ${SCALE.users}) + 1)::text, 9, '0'),
           '{"email":"bench@loopskey.test"}'::jsonb,
           now() - ((g % 100000) || ' seconds')::interval,
           now() - ((g % 100000) || ' seconds')::interval,
           CASE WHEN g % 50 = 0 THEN NULL ELSE now() END, 0
    FROM generate_series(1, ${SCALE.outboxEvents}) g`),
  );

  await step("ANALYZE", () => prisma.$executeRawUnsafe("ANALYZE"));

  const rows = await prisma.$queryRawUnsafe(`
    SELECT relname, n_live_tup, pg_size_pretty(pg_total_relation_size(relid)) AS size
    FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY n_live_tup DESC`);

  const total = rows.reduce((sum, row) => sum + Number(row.n_live_tup), 0);
  console.log("\nSeeded tables:");
  console.table(
    rows.map((row) => ({
      table: row.relname,
      rows: Number(row.n_live_tup),
      size: row.size,
    })),
  );
  console.log("TOTAL ROWS: " + total.toLocaleString());
  console.log(
    "members=" + memberCount +
    " assignments=" + assignmentCount +
    " attributions=" + attributionCount,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
