import { CourseStatus, IngestionContentKind } from "@prisma/client";
import { IngestionItemState, Role, UserStatus } from "@prisma/client";
import { AuditAction, IngestionReviewReason } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

import { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import { COURSE_INGESTION_CONTRACT_VERSION } from "@ingestion/enums/course-ingestion.constant";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

import { bootApp, fulfilled, runTogether } from "../setup/concurrency";

const SLUG_PREFIX = "ingestion-review-e2e";

const FIELD_MAP = {
  external_course_id: "externalId",
  source_url: "canonicalUrl",
  source_platform: "sourcePlatform",
  title: "title",
  description: "description",
  instructor: "instructor",
};

const unique = () =>
  `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const rawItem = (overrides: Record<string, unknown> = {}) => ({
  external_course_id: `ext-${unique()}`,
  source_url: "https://www.coursera.org/learn/applied-ml",
  source_platform: "COURSERA",
  title: "Applied Machine Learning",
  description: "A course about applied machine learning.",
  instructor: "Ada Lovelace",
  ...overrides,
});

/**
 * The review queue's two hard invariants under real overlap and real re-crawl.
 *
 * The assertions are the database state, not which promise resolved: an
 * implementation that read the item and then wrote it back would let both
 * concurrent approvals through and still report success to both.
 */
describe("Ingestion review (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: IngestionAdminService;
  let ingestion: CourseIngestionService;
  let adminUserId: string;

  const cleanup = async () => {
    const sources = await prisma.ingestionSource.findMany({
      where: { slug: { startsWith: SLUG_PREFIX } },
      select: { id: true },
    });
    const sourceIds = sources.map((source) => source.id);
    if (sourceIds.length) {
      const items = await prisma.ingestionItem.findMany({
        where: { sourceId: { in: sourceIds } },
        select: { catalogId: true },
      });
      const catalogIds = items
        .map((item) => item.catalogId)
        .filter((id): id is string => !!id);
      if (catalogIds.length)
        await prisma.course.deleteMany({ where: { id: { in: catalogIds } } });
      await prisma.ingestionSource.deleteMany({
        where: { id: { in: sourceIds } },
      });
    }
    await prisma.user.deleteMany({
      where: { email: `admin-${SLUG_PREFIX}@e2e.example.test` },
    });
  };

  const createSource = async (
    autoPublish = false,
  ): Promise<TIngestionSourceContext> => {
    const source = await prisma.ingestionSource.create({
      data: {
        slug: `${SLUG_PREFIX}-${unique()}`,
        name: "Review queue source",
        kind: IngestionContentKind.COURSE,
        autoPublish,
        fieldMap: FIELD_MAP,
      },
    });
    return {
      keyId: `key-${source.id}`,
      keyPrefix: "aaaaaaaaaaaa",
      sourceId: source.id,
      sourceSlug: source.slug,
      kind: source.kind,
      autoPublish: source.autoPublish,
      stalenessWindowDays: source.stalenessWindowDays,
      fieldMap: source.fieldMap,
    };
  };

  const submitOne = (source: TIngestionSourceContext, item: unknown) =>
    ingestion.submit({
      source,
      envelope: {
        contractVersion: COURSE_INGESTION_CONTRACT_VERSION,
        kind: IngestionContentKind.COURSE,
        mode: "INCREMENTAL",
        dryRun: false,
        items: [item],
      },
      idempotencyKey: `idem-${unique()}`,
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    admin = app.get(IngestionAdminService);
    ingestion = app.get(CourseIngestionService);
    await cleanup();
    const adminUser = await prisma.user.create({
      data: {
        email: `admin-${SLUG_PREFIX}@e2e.example.test`,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    adminUserId = adminUser.id;
  }, 120000);

  afterAll(async () => {
    await cleanup();
    await app.close();
  }, 60000);

  it("lets exactly one of two concurrent approvals publish the item", async () => {
    const source = await createSource();
    const receipt = await submitOne(source, rawItem());
    const itemId = (
      await prisma.ingestionItem.findFirstOrThrow({
        where: { sourceId: source.sourceId },
      })
    ).id;
    expect(receipt.items[0].state).toBe("created");
    const eventsBeforeApproval = await prisma.outboxEvent.count({
      where: { aggregateType: "IngestionItem", aggregateId: itemId },
    });

    const results = await runTogether(2, () =>
      admin.approveItem(adminUserId, itemId),
    );

    expect(fulfilled(results)).toHaveLength(2);
    for (const { value } of fulfilled(results))
      expect(value.state).toBe(IngestionItemState.ACCEPTED);

    const item = await prisma.ingestionItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    expect(item.state).toBe(IngestionItemState.ACCEPTED);
    expect(item.reviewedById).toBe(adminUserId);

    const course = await prisma.course.findUniqueOrThrow({
      where: { id: item.catalogId! },
    });
    expect(course.status).toBe(CourseStatus.PUBLISHED);

    const eventsAfterApproval = await prisma.outboxEvent.count({
      where: { aggregateType: "IngestionItem", aggregateId: itemId },
    });
    expect(eventsAfterApproval - eventsBeforeApproval).toBe(1);
  }, 120000);

  it("splits a queue between two concurrent bulk approvals without approving or publishing anything twice", async () => {
    const source = await createSource();
    for (let index = 0; index < 20; index += 1)
      await submitOne(source, rawItem());
    const items = await prisma.ingestionItem.findMany({
      where: { sourceId: source.sourceId },
    });
    const itemIds = items.map((item) => item.id);
    const eventsBefore = await prisma.outboxEvent.count({
      where: { aggregateType: "IngestionItem", aggregateId: { in: itemIds } },
    });

    const results = await runTogether(2, () =>
      admin.approveItems(adminUserId, { sourceId: source.sourceId }),
    );

    expect(fulfilled(results)).toHaveLength(2);
    const approved = fulfilled(results).reduce(
      (total, { value }) => total + value.approvedCount,
      0,
    );
    expect(approved).toBe(20);

    const after = await prisma.ingestionItem.findMany({
      where: { sourceId: source.sourceId },
    });
    expect(
      after.every((item) => item.state === IngestionItemState.ACCEPTED),
    ).toBe(true);
    expect(after.every((item) => item.reviewedById === adminUserId)).toBe(true);

    const courses = await prisma.course.findMany({
      where: { id: { in: after.map((item) => item.catalogId!) } },
    });
    expect(
      courses.every((course) => course.status === CourseStatus.PUBLISHED),
    ).toBe(true);

    const eventsAfter = await prisma.outboxEvent.count({
      where: { aggregateType: "IngestionItem", aggregateId: { in: itemIds } },
    });
    expect(eventsAfter - eventsBefore).toBe(20);
  }, 120000);

  it("approves only the selected items and leaves the rest of the queue pending", async () => {
    const source = await createSource();
    for (let index = 0; index < 4; index += 1)
      await submitOne(source, rawItem());
    const items = await prisma.ingestionItem.findMany({
      where: { sourceId: source.sourceId },
      orderBy: { id: "asc" },
    });
    const selected = items.slice(0, 2).map((item) => item.id);

    const result = await admin.approveItems(adminUserId, {
      itemIds: selected,
    });

    expect(result.approvedCount).toBe(2);
    const states = await prisma.ingestionItem.findMany({
      where: { sourceId: source.sourceId },
    });
    expect(
      states.filter((item) => item.state === IngestionItemState.ACCEPTED),
    ).toHaveLength(2);
    expect(
      states.filter((item) => item.state === IngestionItemState.PENDING),
    ).toHaveLength(2);
  }, 120000);

  it("keeps a rejected item rejected on an unchanged re-crawl, and returns it to the queue when content changes", async () => {
    const source = await createSource();
    const item = rawItem();
    await submitOne(source, item);
    const itemId = (
      await prisma.ingestionItem.findFirstOrThrow({
        where: { sourceId: source.sourceId },
      })
    ).id;

    const rejected = await admin.rejectItem(
      adminUserId,
      itemId,
      "Duplicate of an existing course.",
    );
    expect(rejected.state).toBe(IngestionItemState.REJECTED);
    const publishedCourse = await prisma.course.findUniqueOrThrow({
      where: { id: rejected.catalogId! },
    });
    expect(publishedCourse.status).toBe(CourseStatus.DRAFT);

    await submitOne(source, item);
    const stillRejected = await prisma.ingestionItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    expect(stillRejected.state).toBe(IngestionItemState.REJECTED);
    expect(stillRejected.rejectionReason).toBe(
      "Duplicate of an existing course.",
    );

    await submitOne(source, { ...item, title: "Applied Machine Learning v2" });
    const backInQueue = await prisma.ingestionItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    expect(backInQueue.state).toBe(IngestionItemState.PENDING);
    expect(backInQueue.rejectionReason).toBeNull();
  }, 120000);

  const itemFor = (sourceId: string, externalId: string) =>
    prisma.ingestionItem.findUniqueOrThrow({
      where: { sourceId_externalId: { sourceId, externalId } },
    });

  const statusOf = async (catalogId: string | null) =>
    (await prisma.course.findUniqueOrThrow({ where: { id: catalogId! } }))
      .status;

  it("holds placeholder probes from an auto-publishing source and publishes legitimate courses with ambiguous words or other languages", async () => {
    const source = await createSource(true);
    const probes = [
      rawItem({ title: "probe", description: "connectivity probe" }),
      rawItem({
        title: "probe via tunnel",
        description: "tunnel connectivity probe",
      }),
    ];
    const genuine = [
      rawItem({
        title: "Software Testing Fundamentals",
        description:
          "Learn how to plan, design and automate tests for modern software.",
      }),
      rawItem({
        title: "Gestion de projet agile",
        description:
          "Une introduction complète à la gestion de projet agile en équipe.",
      }),
    ];

    for (const item of [...probes, ...genuine]) await submitOne(source, item);

    for (const probe of probes) {
      const item = await itemFor(source.sourceId, probe.external_course_id);
      expect(item.state).toBe(IngestionItemState.PENDING);
      expect(item.reviewReasons).toContain(
        IngestionReviewReason.PLACEHOLDER_CONTENT,
      );
      expect(await statusOf(item.catalogId)).toBe(CourseStatus.DRAFT);
    }
    for (const course of genuine) {
      const item = await itemFor(source.sourceId, course.external_course_id);
      expect(item.state).toBe(IngestionItemState.ACCEPTED);
      expect(item.reviewReasons).toEqual([]);
      expect(await statusOf(item.catalogId)).toBe(CourseStatus.PUBLISHED);
    }

    const bulk = await admin.approveItems(adminUserId, {
      sourceId: source.sourceId,
    });
    expect(bulk.approvedCount).toBe(0);
    for (const probe of probes)
      expect(
        (await itemFor(source.sourceId, probe.external_course_id)).state,
      ).toBe(IngestionItemState.PENDING);
  }, 120000);

  it("withdraws a published record idempotently with an audit trail, and keeps it withdrawn when the source re-sends changed content", async () => {
    const source = await createSource(true);
    const live = rawItem({
      title: "Applied Statistics",
      description: "A practical course on applied statistics for analysts.",
    });
    await submitOne(source, live);
    const published = await itemFor(source.sourceId, live.external_course_id);
    expect(await statusOf(published.catalogId)).toBe(CourseStatus.PUBLISHED);

    const reason = "Connectivity probe published by mistake.";
    const results = await runTogether(2, () =>
      admin.rejectItem(adminUserId, published.id, reason),
    );
    expect(fulfilled(results)).toHaveLength(2);
    expect(await statusOf(published.catalogId)).toBe(CourseStatus.DRAFT);
    const audits = await prisma.auditLog.findMany({
      where: {
        entityType: "IngestionItem",
        entityId: published.id,
        action: AuditAction.INGESTION_ITEM_REJECTED,
      },
    });
    expect(audits.length).toBeGreaterThanOrEqual(1);
    expect(audits[0].actorId).toBe(adminUserId);

    await submitOne(source, { ...live, description: `${live.description} v2` });
    const resent = await itemFor(source.sourceId, live.external_course_id);
    expect(resent.state).toBe(IngestionItemState.PENDING);
    expect(resent.reviewReasons).toContain(
      IngestionReviewReason.PREVIOUSLY_REJECTED,
    );
    expect(await statusOf(resent.catalogId)).toBe(CourseStatus.DRAFT);

    const bulk = await admin.approveItems(adminUserId, {
      itemIds: [resent.id],
    });
    expect(bulk.approvedCount).toBe(0);

    await admin.approveItem(adminUserId, resent.id);
    expect(await statusOf(resent.catalogId)).toBe(CourseStatus.PUBLISHED);
    expect(
      await prisma.auditLog.count({
        where: {
          entityId: resent.id,
          action: AuditAction.INGESTION_ITEM_APPROVED,
        },
      }),
    ).toBe(1);
  }, 120000);

  it("lets only one of a concurrent approval and withdrawal win, leaving item and catalogue in agreement", async () => {
    const source = await createSource();
    const raw = rawItem();
    await submitOne(source, raw);
    const pending = await itemFor(source.sourceId, raw.external_course_id);

    const results = await runTogether(2, (index) =>
      index === 0
        ? admin.approveItem(adminUserId, pending.id)
        : admin.rejectItem(adminUserId, pending.id, "Withdrawn during review."),
    );

    expect(fulfilled(results)).toHaveLength(1);
    const after = await itemFor(source.sourceId, raw.external_course_id);
    const status = await statusOf(after.catalogId);
    if (after.state === IngestionItemState.ACCEPTED)
      expect(status).toBe(CourseStatus.PUBLISHED);
    else {
      expect(after.state).toBe(IngestionItemState.REJECTED);
      expect(status).toBe(CourseStatus.DRAFT);
    }
  }, 120000);

  it("never lets the key secret or its hash reach an admin response", async () => {
    const source = await createSource();
    const issued = await admin.issueKey(adminUserId, {
      sourceId: source.sourceId,
      name: "audit-check",
    });
    const listed = await admin.listKeys(source.sourceId);

    const written = JSON.stringify({ issued, listed });
    expect(written).toContain(issued.credential);
    expect(written).not.toContain("secretHash");

    const revoked = await admin.revokeKey(adminUserId, issued.id);
    expect(revoked.revokedAt).not.toBeNull();
    expect(JSON.stringify(revoked)).not.toContain("secretHash");

    const stored = await prisma.ingestionApiKey.findUniqueOrThrow({
      where: { id: issued.id },
    });
    expect(stored.revokedAt).not.toBeNull();
  }, 60000);
});
