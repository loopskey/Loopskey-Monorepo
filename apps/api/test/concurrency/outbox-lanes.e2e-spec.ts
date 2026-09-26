import {
  OutboxHandler,
  OutboxHandlerRegistry,
} from "@infrastructure/outbox/outbox-handler.port";
import { OutboxProcessor } from "@infrastructure/outbox/outbox-processor.service";
import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const REALTIME_EVENT_NAME = "concurrency.outbox-lanes.realtime";
const BULK_EVENT_NAME = "concurrency.outbox-lanes.bulk";
const REALTIME_HANDLER_NAME = "concurrency-lanes-realtime-v1";
const BULK_HANDLER_NAME = "concurrency-lanes-bulk-v1";

/**
 * Proves the realtime/bulk lane split itself, not just the shared claim
 * query that `outbox-delivery.e2e-spec.ts` already covers: a realtime event
 * must be claimed even while a large bulk backlog with earlier `occurredAt`
 * values is still pending, and the two lane pollers must never claim the
 * same row.
 */
describe("Outbox priority lanes (concurrency e2e)", () => {
  const prisma = new PrismaClient() as unknown as PrismaService;
  const realtimeHandled: OutboxEventContext[] = [];
  const bulkHandled: OutboxEventContext[] = [];

  const config = {
    get: (_key: string, fallback?: string) => fallback,
  } as unknown as ConfigService;

  const buildRegistry = () => {
    const registry = new OutboxHandlerRegistry();
    const realtimeHandler: OutboxHandler = {
      eventName: REALTIME_EVENT_NAME,
      handlerName: REALTIME_HANDLER_NAME,
      lane: "realtime",
      handle: async (_payload, context) => {
        realtimeHandled.push(context);
      },
    };
    const bulkHandler: OutboxHandler = {
      eventName: BULK_EVENT_NAME,
      handlerName: BULK_HANDLER_NAME,
      lane: "bulk",
      handle: async (_payload, context) => {
        bulkHandled.push(context);
      },
    };
    registry.register(realtimeHandler);
    registry.register(bulkHandler);
    return registry;
  };

  const buildProcessor = (
    registry: OutboxHandlerRegistry,
    lane: "realtime" | "bulk",
  ) => {
    const processor = new OutboxProcessor(prisma, registry, config, { lane });
    // Read the configured lease without leaving a poll timer behind.
    processor.onModuleInit();
    processor.onModuleDestroy();
    return processor;
  };

  const seed = async (eventName: string, count: number, occurredAt: Date) => {
    const ids: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const event = await prisma.outboxEvent.create({
        data: {
          eventName,
          aggregateType: "ConcurrencyLanesProbe",
          aggregateId: `${eventName}-${index}`,
          payload: { index },
          occurredAt,
          correlationId: `${eventName}-${index}`,
        },
      });
      ids.push(event.id);
    }
    return ids;
  };

  const cleanup = () =>
    prisma.outboxEvent.deleteMany({
      where: { eventName: { in: [REALTIME_EVENT_NAME, BULK_EVENT_NAME] } },
    });

  beforeAll(async () => {
    await cleanup();
  }, 60_000);

  afterAll(async () => {
    await cleanup();
    await (prisma as unknown as PrismaClient).$disconnect();
  }, 60_000);

  beforeEach(async () => {
    realtimeHandled.length = 0;
    bulkHandled.length = 0;
    await cleanup();
  });

  it("claims a realtime event while a large, older bulk backlog is still pending", async () => {
    // Seeded far older than the realtime event, so a shared FIFO queue would
    // reach every one of these first — the behaviour this split exists to
    // prevent.
    await seed(BULK_EVENT_NAME, 200, new Date("2000-01-01T00:00:00.000Z"));
    const [realtimeId] = await seed(
      REALTIME_EVENT_NAME,
      1,
      new Date("2020-01-01T00:00:00.000Z"),
    );
    const registry = buildRegistry();
    const realtimeProcessor = buildProcessor(registry, "realtime");

    await realtimeProcessor.processNext();

    expect(realtimeHandled.map((context) => context.id)).toEqual([realtimeId]);
    const event = await prisma.outboxEvent.findUniqueOrThrow({
      where: { id: realtimeId },
    });
    expect(event.processedAt).not.toBeNull();
  }, 120_000);

  it("never lets the two lanes claim the same row", async () => {
    const bulkIds = await seed(
      BULK_EVENT_NAME,
      20,
      new Date("2000-01-01T00:00:00.000Z"),
    );
    const realtimeIds = await seed(
      REALTIME_EVENT_NAME,
      20,
      new Date("2000-01-01T00:00:00.000Z"),
    );
    const registry = buildRegistry();
    const realtimeProcessor = buildProcessor(registry, "realtime");
    const bulkProcessor = buildProcessor(registry, "bulk");

    // Enough concurrent rounds, from two competing lane pollers, to cover
    // every seeded row: a lane boundary that leaked would show up either as a
    // cross-lane double claim or as an event neither handler ever saw.
    await Promise.all(
      Array.from({ length: 20 }, () =>
        Promise.all([
          realtimeProcessor.processNext(),
          bulkProcessor.processNext(),
        ]),
      ),
    );

    expect(realtimeHandled.map((context) => context.id).sort()).toEqual(
      [...realtimeIds].sort(),
    );
    expect(bulkHandled.map((context) => context.id).sort()).toEqual(
      [...bulkIds].sort(),
    );
    const handledIds = [
      ...realtimeHandled.map((context) => context.id),
      ...bulkHandled.map((context) => context.id),
    ];
    expect(new Set(handledIds).size).toBe(handledIds.length);
  }, 120_000);

  it("assigns every registered handler's event name to exactly one lane", () => {
    const registry = buildRegistry();

    const realtimeNames = registry.eventNamesForLane("realtime");
    const bulkNames = registry.eventNamesForLane("bulk");

    expect(realtimeNames).toContain(REALTIME_EVENT_NAME);
    expect(bulkNames).toContain(BULK_EVENT_NAME);
    expect(realtimeNames.some((name) => bulkNames.includes(name))).toBe(false);
  });
});
