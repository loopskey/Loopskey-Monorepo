import { IngestionContentKind } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import type { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import type { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import type { OutboxService } from "@infrastructure/outbox/outbox.service";

describe("IngestionAdminService", () => {
  const create = jest.fn();
  const findMany = jest.fn();
  const count = jest.fn();
  const $queryRaw = jest.fn();

  const prisma = {
    ingestionSource: { create, findMany, count },
    ingestionItem: { findMany, count },
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
    $queryRaw.mockResolvedValue([{ id: "course-1" }]);
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await service.listItems({ search: "ai" }, { take: 20 });

    expect($queryRaw).toHaveBeenCalledTimes(1);
  });
});
