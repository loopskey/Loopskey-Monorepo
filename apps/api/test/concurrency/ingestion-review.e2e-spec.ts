import { CourseStatus, IngestionContentKind } from "@prisma/client";
import { IngestionItemState, Role, UserStatus } from "@prisma/client";
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

  const createSource = async (): Promise<TIngestionSourceContext> => {
    const source = await prisma.ingestionSource.create({
      data: {
        slug: `${SLUG_PREFIX}-${unique()}`,
        name: "Review queue source",
        kind: IngestionContentKind.COURSE,
        autoPublish: false,
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
