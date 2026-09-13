import { IngestionContentKind, IngestionItemState } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import type { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import type { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import type { OutboxService } from "@infrastructure/outbox/outbox.service";

describe("IngestionAdminService", () => {
  const create = jest.fn();
  const findMany = jest.fn();
  const findUnique = jest.fn();
  const count = jest.fn();
  const $queryRaw = jest.fn();

  const prisma = {
    ingestionSource: { create, findMany, count },
    ingestionItem: { findMany, findUnique, count },
    $queryRaw,
  } as unknown as PrismaService;

  const service = new IngestionAdminService(
    prisma,
    {} as IngestionApiKeyService,
    {} as CourseIngestionService,
    {} as OutboxService,
  );

  beforeEach(() => jest.clearAllMocks());

  it("rejects a field map that renames onto an unknown canonical target", async () => {
    await expect(
      service.createSource("admin-1", {
        slug: "acme",
        name: "Acme",
        kind: IngestionContentKind.COURSE,
        fieldMap: { source_title: "title.toUpperCase()" },
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: "INGESTION_FIELD_MAP_INVALID",
      }),
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("accepts a field map that renames onto a canonical event field", async () => {
    create.mockResolvedValue({ id: "source-1", slug: "acme-events" });
    await service.createSource("admin-1", {
      slug: "acme-events",
      name: "Acme events",
      kind: IngestionContentKind.EVENT,
      fieldMap: { source_title: "title", starts_at: "startDate" },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fieldMap: { source_title: "title", starts_at: "startDate" },
        }),
      }),
    );
  });

  it("rejects an event field map whose target is not a canonical event field", async () => {
    await expect(
      service.createSource("admin-1", {
        slug: "acme-events",
        name: "Acme events",
        kind: IngestionContentKind.EVENT,
        fieldMap: { source_title: "not_a_field" },
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: "INGESTION_FIELD_MAP_INVALID",
      }),
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("accepts an empty field map on a non-course kind", async () => {
    create.mockResolvedValue({ id: "source-1", slug: "acme-events" });
    await service.createSource("admin-1", {
      slug: "acme-events",
      name: "Acme events",
      kind: IngestionContentKind.PODCAST,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fieldMap: {} }),
      }),
    );
  });

  it("does not query for matching titles when the search term is below the minimum length", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await service.listItems({ search: "a" }, { take: 20 });

    expect($queryRaw).not.toHaveBeenCalled();
  });

  it("queries for matching titles once the search term reaches the minimum length", async () => {
    $queryRaw
      .mockResolvedValueOnce([{ count: 1n }])
      .mockResolvedValueOnce([{ id: "course-1" }]);
    findMany.mockResolvedValue([]);

    await service.listItems({ search: "ai" }, { take: 20 });

    expect($queryRaw).toHaveBeenCalledTimes(2);
  });

  it("reports every true match in totalCount, unbounded by the old 500-row cap", async () => {
    $queryRaw
      .mockResolvedValueOnce([{ count: 1500n }])
      .mockResolvedValueOnce([]);
    findMany.mockResolvedValue([]);

    const result = await service.listItems({ search: "course" }, { take: 20 });

    expect(result.totalCount).toBe(1500);
  });

  it("joins the matching-catalog-ids search against IngestionItem without a row cap on the match set", async () => {
    $queryRaw.mockResolvedValueOnce([{ count: 0n }]).mockResolvedValueOnce([]);
    findMany.mockResolvedValue([]);

    await service.listItems({ search: "course" }, { take: 20 });

    const [countCall, pageCall] = $queryRaw.mock.calls.map(([sql]) => sql.sql);
    for (const sql of [countCall, pageCall]) {
      expect(sql).toContain("JOIN (");
      expect(sql).not.toMatch(/LIMIT\s+500\b/);
    }
    expect(pageCall).toContain("LIMIT");
  });

  it("carries the sourceId and state filters into the search-path query", async () => {
    $queryRaw.mockResolvedValueOnce([{ count: 0n }]).mockResolvedValueOnce([]);
    findMany.mockResolvedValue([]);

    await service.listItems(
      {
        search: "course",
        sourceId: "source-1",
        state: IngestionItemState.PENDING,
      },
      { take: 20 },
    );

    const [countCall] = $queryRaw.mock.calls.map(([sql]) => sql.values);
    expect(countCall).toEqual(expect.arrayContaining(["source-1", "PENDING"]));
  });

  it("returns an empty page without dropping the total when the cursor no longer exists", async () => {
    findUnique.mockResolvedValue(null);
    $queryRaw.mockResolvedValueOnce([{ count: 3n }]);

    const result = await service.listItems(
      { search: "course" },
      { take: 20, cursor: "gone" },
    );

    expect(result.items).toEqual([]);
    expect(result.totalCount).toBe(3);
    expect($queryRaw).toHaveBeenCalledTimes(1);
  });
});
