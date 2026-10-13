import { IngestionContentKind } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import { INGESTION_BULK_APPROVE_CHUNK_SIZE } from "@ingestion/enums/ingestion-review.constant";
import type { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import type { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import type { OutboxService } from "@infrastructure/outbox/outbox.service";

describe("IngestionAdminService.approveItems", () => {
  const txQueryRaw = jest.fn();
  const queryRaw = jest.fn();
  const courseUpdateMany = jest.fn();
  const eventUpdateMany = jest.fn();
  const podcastUpdateMany = jest.fn();
  const youTubeUpdateMany = jest.fn();
  const appendMany = jest.fn();

  const tx = {
    $queryRaw: txQueryRaw,
    course: { updateMany: courseUpdateMany },
    event: { updateMany: eventUpdateMany },
    podcast: { updateMany: podcastUpdateMany },
    youTubeChannel: { updateMany: youTubeUpdateMany },
  };
  const transaction = jest.fn(
    async (callback: (client: typeof tx) => unknown, _options?: unknown) =>
      callback(tx),
  );

  const prisma = {
    $transaction: transaction,
    $queryRaw: queryRaw,
  } as unknown as PrismaService;

  const service = new IngestionAdminService(
    prisma,
    {} as IngestionApiKeyService,
    {} as CourseIngestionService,
    { appendMany } as unknown as OutboxService,
  );

  const claimed = (
    id: string,
    kind: IngestionContentKind,
    catalogId: string | null = `catalog-${id}`,
  ) => ({ id, sourceId: `source-${kind}`, catalogId, kind });

  const claimSql = () =>
    txQueryRaw.mock.calls[0][0] as {
      sql: string;
      values: unknown[];
    };

  beforeEach(() => {
    jest.clearAllMocks();
    queryRaw.mockResolvedValue([{ count: 0n }]);
    txQueryRaw.mockResolvedValue([]);
  });

  it("publishes every claimed catalogue row per kind and appends one event per item in the same transaction", async () => {
    txQueryRaw.mockResolvedValue([
      claimed("item-1", IngestionContentKind.COURSE),
      claimed("item-2", IngestionContentKind.COURSE),
      claimed("item-3", IngestionContentKind.PODCAST),
    ]);

    await service.approveItems("admin-1", {});

    expect(courseUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["catalog-item-1", "catalog-item-2"] } },
      data: { status: "PUBLISHED", publicContentUpdatedAt: expect.any(Date) },
    });
    expect(podcastUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["catalog-item-3"] } },
      data: { status: "PUBLISHED", publicContentUpdatedAt: expect.any(Date) },
    });
    expect(eventUpdateMany).not.toHaveBeenCalled();
    expect(youTubeUpdateMany).not.toHaveBeenCalled();
    expect(appendMany).toHaveBeenCalledTimes(1);
    const [events, writer] = appendMany.mock.calls[0];
    expect(writer).toBe(tx);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({
      eventName: "ingestion.item.published",
      aggregateType: "IngestionItem",
      aggregateId: "item-1",
      payload: {
        itemId: "item-1",
        sourceId: "source-COURSE",
        catalogId: "catalog-item-1",
      },
    });
  });

  it("reports how many items were approved and how many are still waiting", async () => {
    txQueryRaw.mockResolvedValue([
      claimed("item-1", IngestionContentKind.EVENT),
    ]);
    queryRaw.mockResolvedValue([{ count: 1499n }]);

    await expect(service.approveItems("admin-1", {})).resolves.toEqual({
      approvedCount: 1,
      remainingCount: 1499,
    });
  });

  it("writes nothing when no item could be claimed", async () => {
    await expect(service.approveItems("admin-1", {})).resolves.toEqual({
      approvedCount: 0,
      remainingCount: 0,
    });

    expect(courseUpdateMany).not.toHaveBeenCalled();
    expect(appendMany).not.toHaveBeenCalled();
  });

  it("claims only pending items that have a catalogue row, in bounded chunks, skipping rows another admin holds", async () => {
    await service.approveItems("admin-1", {});

    const { sql, values } = claimSql();
    expect(sql).toContain('c."catalogId" IS NOT NULL');
    expect(sql).toContain(`c."state" = 'PENDING'`);
    expect(sql).toContain("FOR UPDATE OF c SKIP LOCKED");
    expect(sql).toContain("ii.\"state\" <> 'ACCEPTED'");
    expect(sql).toContain("LIMIT");
    expect(values).toContain(INGESTION_BULK_APPROVE_CHUNK_SIZE);
    expect(values).toContain("admin-1");
  });

  it("narrows the queue to one source", async () => {
    await service.approveItems("admin-1", { sourceId: "source-9" });

    expect(claimSql().sql).toContain('c."sourceId" =');
    expect(claimSql().values).toContain("source-9");
  });

  it("ignores a search term shorter than the minimum and applies a longer one", async () => {
    await service.approveItems("admin-1", { search: "a" });
    expect(claimSql().sql).not.toContain('"Course"');

    txQueryRaw.mockClear();
    await service.approveItems("admin-1", { search: " ai " });
    expect(claimSql().sql).toContain('"Course"');
    expect(claimSql().values).toContain("ai");
  });

  it("approves exactly the selected items, whatever their review state, and nothing else", async () => {
    await service.approveItems("admin-1", { itemIds: ["item-1", "item-2"] });

    const { sql, values } = claimSql();
    expect(sql).toContain('c."id" = ANY(');
    expect(sql).not.toContain(`c."state" = 'PENDING'`);
    expect(values).toContainEqual(["item-1", "item-2"]);
  });

  it("counts what is still approvable with the same conditions as the claim", async () => {
    await service.approveItems("admin-1", { sourceId: "source-9" });

    const [{ sql, values }] = queryRaw.mock.calls[0];
    expect(sql).toContain('c."catalogId" IS NOT NULL');
    expect(sql).toContain(`c."state" = 'PENDING'`);
    expect(values).toContain("source-9");
  });

  it("runs the claim, the publication and the events inside one transaction", async () => {
    await service.approveItems("admin-1", {});

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0][1]).toMatchObject({
      timeout: expect.any(Number),
    });
  });
});
