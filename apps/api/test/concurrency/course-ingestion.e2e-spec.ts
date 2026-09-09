import { CourseStatus, IngestionContentKind } from "@prisma/client";
import { IngestionItemState } from "@prisma/client";
import { HttpException, INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

import { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import { COURSE_INGESTION_CONTRACT_VERSION } from "@ingestion/enums/course-ingestion.constant";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

import { bootApp, fulfilled, runTogether } from "../setup/concurrency";

const SLUG_PREFIX = "course-ingest-e2e";

const FIELD_MAP = {
  external_course_id: "externalId",
  source_url: "canonicalUrl",
  source_platform: "sourcePlatform",
  title: "title",
  description: "description",
  instructor: "instructor",
  image_url: "imageCandidateUrl",
  category: "category",
  level: "level",
  price: "price",
  currency: "currency",
  is_free: "isFree",
  duration_minutes: "durationMinutes",
  last_updated_at: "lastUpdatedAt",
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
  category: "TECHNOLOGY",
  level: "BEGINNER",
  price: "49",
  currency: "USD",
  is_free: "no",
  duration_minutes: "6 hours",
  last_updated_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const envelope = (items: unknown[], dryRun = false) => ({
  contractVersion: COURSE_INGESTION_CONTRACT_VERSION,
  kind: IngestionContentKind.COURSE,
  mode: "INCREMENTAL",
  dryRun,
  items,
});

describe("Course ingestion endpoint (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ingestion: CourseIngestionService;

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
        .filter((id): id is string => id !== null);
      if (catalogIds.length)
        await prisma.course.deleteMany({ where: { id: { in: catalogIds } } });
      await prisma.ingestionSource.deleteMany({
        where: { id: { in: sourceIds } },
      });
    }
    await prisma.outboxEvent.deleteMany({
      where: { eventName: "ingestion.item.published" },
    });
  };

  const createSource = async (
    overrides: { autoPublish?: boolean } = {},
  ): Promise<TIngestionSourceContext> => {
    const source = await prisma.ingestionSource.create({
      data: {
        slug: `${SLUG_PREFIX}-${unique()}`,
        name: "Course ingestion source",
        kind: IngestionContentKind.COURSE,
        autoPublish: overrides.autoPublish ?? false,
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

  const submit = (
    source: TIngestionSourceContext,
    items: unknown[],
    options: { idempotencyKey?: string; dryRun?: boolean } = {},
  ) =>
    ingestion.submit({
      source,
      envelope: envelope(items, options.dryRun ?? false),
      idempotencyKey: options.idempotencyKey ?? `idem-${unique()}`,
    });

  const outboxCount = () =>
    prisma.outboxEvent.count({
      where: { eventName: "ingestion.item.published" },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    ingestion = app.get(CourseIngestionService);
    await cleanup();
  }, 120000);

  afterAll(async () => {
    await cleanup();
    await app.close();
  }, 60000);

  it("creates a course per item and returns its catalog identifier", async () => {
    const source = await createSource();
    const items = [rawItem(), rawItem()];

    const receipt = await submit(source, items);

    expect(receipt.createdCount).toBe(2);
    expect(receipt.rejectedCount).toBe(0);
    expect(receipt.items).toHaveLength(2);
    for (const report of receipt.items) {
      expect(report.state).toBe("created");
      expect(report.catalogId).toEqual(expect.any(String));
      const course = await prisma.course.findUniqueOrThrow({
        where: { id: report.catalogId as string },
      });
      expect(course.externalRef).toBe(
        `${source.sourceSlug}:${report.externalId}`,
      );
    }
  }, 120000);

  it("returns the original batch when an idempotency key is replayed", async () => {
    const source = await createSource();
    const items = [rawItem()];
    const idempotencyKey = `replay-${unique()}`;

    const first = await submit(source, items, { idempotencyKey });
    const second = await submit(source, items, { idempotencyKey });

    expect(second.batchId).toBe(first.batchId);
    expect(second.items).toEqual(first.items);
    expect(
      await prisma.ingestionBatch.count({
        where: { sourceId: source.sourceId, idempotencyKey },
      }),
    ).toBe(1);
    expect(
      await prisma.course.count({
        where: { externalRef: { startsWith: `${source.sourceSlug}:` } },
      }),
    ).toBe(1);
  }, 120000);

  it("reports unchanged content without moving updatedAt or appending an event", async () => {
    const source = await createSource();
    const items = [rawItem()];

    const first = await submit(source, items);
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: first.items[0].catalogId as string },
    });
    const eventsAfterCreate = await outboxCount();

    const second = await submit(source, items);
    const unchanged = await prisma.course.findUniqueOrThrow({
      where: { id: course.id },
    });

    expect(second.unchangedCount).toBe(1);
    expect(second.items[0].state).toBe("unchanged");
    expect(unchanged.updatedAt.getTime()).toBe(course.updatedAt.getTime());
    expect(await outboxCount()).toBe(eventsAfterCreate);
  }, 120000);

  it("updates a changed item, keeps its slug, and appends one event", async () => {
    const source = await createSource();
    const item = rawItem();

    const first = await submit(source, [item]);
    const created = await prisma.course.findUniqueOrThrow({
      where: { id: first.items[0].catalogId as string },
    });
    const before = await outboxCount();

    const second = await submit(source, [
      { ...item, title: "Applied Machine Learning, Second Edition" },
    ]);
    const updated = await prisma.course.findUniqueOrThrow({
      where: { id: created.id },
    });

    expect(second.updatedCount).toBe(1);
    expect(updated.slug).toBe(created.slug);
    expect(updated.title).toBe("Applied Machine Learning, Second Edition");
    expect(await outboxCount()).toBe(before + 1);
  }, 120000);

  it("records unmapped field names and stores none of their values", async () => {
    const source = await createSource();
    const secret = `unmapped-secret-${unique()}`;

    const receipt = await submit(source, [
      rawItem({ vendor_notes: secret, internal_score: 42 }),
    ]);

    expect(receipt.items[0].state).toBe("created");
    expect(receipt.items[0].unmappedFields).toEqual([
      "internal_score",
      "vendor_notes",
    ]);
    expect(receipt.items[0].unmappedValues).toBeUndefined();

    const item = await prisma.ingestionItem.findFirstOrThrow({
      where: { sourceId: source.sourceId },
    });
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: item.catalogId as string },
    });
    expect(JSON.stringify({ item, course })).not.toContain(secret);
  }, 120000);

  it("rejects an item with no external id or canonical url and lands the rest", async () => {
    const source = await createSource();

    const receipt = await submit(source, [
      rawItem({ external_course_id: "" }),
      rawItem({ source_url: "" }),
      rawItem(),
    ]);

    expect(receipt.rejectedCount).toBe(2);
    expect(receipt.createdCount).toBe(1);
    for (const report of receipt.items.filter(
      (entry) => entry.state === "rejected",
    ))
      expect(report.reason).toEqual(expect.any(String));
  }, 120000);

  it("lands ninety-seven of a hundred items when three are invalid", async () => {
    const source = await createSource();
    const items = [
      ...Array.from({ length: 97 }, () => rawItem()),
      rawItem({ title: "" }),
      rawItem({ source_url: "not-a-url" }),
      rawItem({ external_course_id: "" }),
    ];

    const receipt = await submit(source, items);

    expect(receipt.receivedCount).toBe(100);
    expect(receipt.createdCount).toBe(97);
    expect(receipt.rejectedCount).toBe(3);
    expect(
      await prisma.ingestionItem.count({
        where: {
          sourceId: source.sourceId,
          state: { not: IngestionItemState.REJECTED },
        },
      }),
    ).toBe(97);
  }, 180000);

  it("writes nothing on a dry run", async () => {
    const source = await createSource();
    const items = [rawItem(), rawItem({ title: "" })];

    const preview = await submit(source, items, { dryRun: true });

    expect(preview.batchId).toBeNull();
    expect(preview.dryRun).toBe(true);
    expect(preview.createdCount).toBe(1);
    expect(preview.rejectedCount).toBe(1);
    for (const report of preview.items) expect(report.catalogId).toBeNull();
    expect(
      await prisma.ingestionBatch.count({
        where: { sourceId: source.sourceId },
      }),
    ).toBe(0);
    expect(
      await prisma.ingestionItem.count({
        where: { sourceId: source.sourceId },
      }),
    ).toBe(0);
  }, 120000);

  it("writes a draft course that no anonymous catalog query returns", async () => {
    const source = await createSource({ autoPublish: false });

    const receipt = await submit(source, [rawItem()]);
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: receipt.items[0].catalogId as string },
    });

    expect(course.status).toBe(CourseStatus.DRAFT);
    expect(
      await prisma.course.count({
        where: { id: course.id, status: CourseStatus.PUBLISHED },
      }),
    ).toBe(0);
  }, 120000);

  it("publishes when the source says so, never when the request does", async () => {
    const published = await createSource({ autoPublish: true });

    const receipt = await submit(published, [rawItem()]);
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: receipt.items[0].catalogId as string },
    });

    expect(course.status).toBe(CourseStatus.PUBLISHED);
  }, 120000);

  it("rejects an item that tries to set a platform-owned field", async () => {
    const source = await createSource();

    const receipt = await submit(source, [
      rawItem({ status: "PUBLISHED" }),
      rawItem({ isFeatured: true }),
      rawItem({ providerId: "someone" }),
      rawItem({ autoPublish: true }),
    ]);

    expect(receipt.rejectedCount).toBe(4);
    expect(receipt.createdCount).toBe(0);
    for (const report of receipt.items)
      expect(report.reason).toMatch(/owned by the platform/);
  }, 120000);

  it("hides another source's batch behind the same answer as one that does not exist", async () => {
    const owner = await createSource();
    const stranger = await createSource();
    const receipt = await submit(owner, [rawItem()]);

    const readAsStranger = async (batchId: string) => {
      try {
        await ingestion.getBatch(stranger.sourceId, batchId);
        return null;
      } catch (error) {
        const thrown = error as HttpException;
        return { status: thrown.getStatus(), body: thrown.getResponse() };
      }
    };

    const foreign = await readAsStranger(receipt.batchId as string);
    const missing = await readAsStranger("does-not-exist");

    expect(foreign).not.toBeNull();
    expect(missing).not.toBeNull();
    expect(foreign).toEqual(missing);
    await expect(
      ingestion.getBatch(owner.sourceId, receipt.batchId as string),
    ).resolves.toMatchObject({
      batchId: receipt.batchId,
      items: receipt.items,
    });
  }, 120000);

  it("stores a description containing markup sanitized", async () => {
    const source = await createSource();

    const receipt = await submit(source, [
      rawItem({
        description: "<script>alert(1)</script>Safe <b>text</b> only.",
      }),
    ]);
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: receipt.items[0].catalogId as string },
    });

    expect(course.description).not.toContain("<script>");
    expect(course.description).not.toContain("<b>");
    expect(course.description).toContain("Safe");
  }, 120000);

  it("ends with one course when two batches carry one external id", async () => {
    const source = await createSource();
    const externalCourseId = `race-${unique()}`;
    const item = rawItem({ external_course_id: externalCourseId });

    const results = await runTogether(2, (index) =>
      submit(source, [{ ...item, title: `Concurrent ${index}` }], {
        idempotencyKey: `race-${index}-${unique()}`,
      }),
    );

    expect(fulfilled(results)).toHaveLength(2);
    expect(
      await prisma.ingestionItem.count({
        where: { sourceId: source.sourceId, externalId: externalCourseId },
      }),
    ).toBe(1);
    expect(
      await prisma.course.count({
        where: { externalRef: `${source.sourceSlug}:${externalCourseId}` },
      }),
    ).toBe(1);
  }, 120000);
});
