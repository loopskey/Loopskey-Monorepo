import {
  OutboxHandler,
  OutboxHandlerRegistry,
} from "@infrastructure/outbox/outbox-handler.port";
import {
  OutboxProcessor,
  outboxIdempotencyKey,
} from "@infrastructure/outbox/outbox-processor.service";
import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const EVENT_NAME = "concurrency.outbox.probe";
const HANDLER_NAME = "concurrency-probe-v1";
const LEASE_MS = 1_000;

/**
 * Outbox claiming, leases, and idempotency across two workers.
 *
 * This suite talks to PostgreSQL directly rather than booting the application:
 * the running app has its own poller, and a second poller competing for the
 * same rows would make every assertion here a coin flip. Seeded events carry an
 * `occurredAt` far in the past so the claim query, which orders oldest-first,
 * always reaches this suite's work before anything another suite left behind.
 */
describe("Outbox delivery (concurrency e2e)", () => {
  const prisma = new PrismaClient() as unknown as PrismaService;
  const handled: OutboxEventContext[] = [];
  let behaviour: (context: OutboxEventContext) => Promise<void> = async () =>
    undefined;

  const config = {
    get: (key: string, fallback?: string) =>
      key === "OUTBOX_LEASE_MS" ? String(LEASE_MS) : fallback,
  } as unknown as ConfigService;

  const buildProcessor = () => {
    const registry = new OutboxHandlerRegistry();
    const handler: OutboxHandler = {
      eventName: EVENT_NAME,
      handlerName: HANDLER_NAME,
      handle: async (_payload, context) => {
        handled.push(context);
        await behaviour(context);
      },
    };
    registry.register(handler);
    const processor = new OutboxProcessor(prisma, registry, config);
    // Read the configured lease without leaving a poll timer behind.
    processor.onModuleInit();
    processor.onModuleDestroy();
    return processor;
  };

  const seed = async (count: number) => {
    const ids: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const event = await prisma.outboxEvent.create({
        data: {
          eventName: EVENT_NAME,
          aggregateType: "ConcurrencyProbe",
          aggregateId: `probe-${index}`,
          payload: { index },
          occurredAt: new Date("2000-01-01T00:00:00.000Z"),
          correlationId: `probe-${index}`,
        },
      });
      ids.push(event.id);
    }
    return ids;
  };

  const cleanup = () =>
    prisma.outboxEvent.deleteMany({ where: { eventName: EVENT_NAME } });

  beforeAll(async () => {
    await cleanup();
  }, 60_000);

  afterAll(async () => {
    await cleanup();
    await (prisma as unknown as PrismaClient).$disconnect();
  }, 60_000);

  beforeEach(async () => {
    handled.length = 0;
    behaviour = async () => undefined;
    await cleanup();
  });

  it("delivers each event exactly once across two competing workers", async () => {
    const ids = await seed(4);
    const workers = [buildProcessor(), buildProcessor()];

    // Four events, two workers, two simultaneous passes each: exactly enough
    // claims to cover the seeded work, so a double claim would leave one event
    // undelivered and this assertion would say so.
    await Promise.all(
      Array.from({ length: 2 }, () =>
        Promise.all(workers.map((worker) => worker.processNext())),
      ),
    );

    expect(handled.map((context) => context.id).sort()).toEqual(
      [...ids].sort(),
    );
    const deliveries = await prisma.outboxDelivery.findMany({
      where: { eventId: { in: ids } },
    });
    expect(deliveries).toHaveLength(4);
    const events = await prisma.outboxEvent.findMany({
      where: { id: { in: ids } },
    });
    for (const event of events) expect(event.processedAt).not.toBeNull();
  }, 120_000);

  it("presents the same idempotency key on every attempt at one event", async () => {
    const [id] = await seed(1);
    const worker = buildProcessor();
    behaviour = async () => {
      throw new Error("provider unavailable");
    };

    await worker.processNext();
    // Skip the backoff the failure just scheduled; the point is the key, not
    // the wait.
    await prisma.outboxEvent.update({
      where: { id },
      data: { availableAt: new Date(Date.now() - 1000) },
    });
    behaviour = async () => undefined;
    await worker.processNext();

    expect(handled).toHaveLength(2);
    expect(handled[0].idempotencyKey).toBe(outboxIdempotencyKey(id));
    expect(handled[1].idempotencyKey).toBe(handled[0].idempotencyKey);
    expect(handled[1].attemptCount).toBeGreaterThan(handled[0].attemptCount);
  }, 120_000);

  it("does not repeat the side effect after a crash that lost only the completion", async () => {
    const [id] = await seed(1);
    const worker = buildProcessor();
    await worker.processNext();
    expect(handled).toHaveLength(1);

    // The delivery row survived; the "processed" mark did not. That is exactly
    // the state a process killed between the two writes leaves behind.
    await prisma.outboxEvent.update({
      where: { id },
      data: { processedAt: null, availableAt: new Date(Date.now() - 1000) },
    });
    await worker.processNext();

    expect(handled).toHaveLength(1);
    const event = await prisma.outboxEvent.findUniqueOrThrow({ where: { id } });
    expect(event.processedAt).not.toBeNull();
  }, 120_000);

  it("keeps a live lease out of a second worker's reach", async () => {
    const [id] = await seed(1);
    const [slow, other] = [buildProcessor(), buildProcessor()];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    behaviour = () => gate;

    const inFlight = slow.processNext();
    await new Promise((resolve) => setTimeout(resolve, 200));
    const leased = await prisma.outboxEvent.findUniqueOrThrow({
      where: { id },
    });
    await other.processNext();
    release();
    await inFlight;

    // The second worker may well have found other work; what it must not have
    // found is this event, which is still inside its lease.
    expect(leased.availableAt.getTime()).toBeGreaterThan(Date.now());
    expect(handled.filter((context) => context.id === id)).toHaveLength(1);
  }, 120_000);

  it("extends the lease while a slow handler is still working", async () => {
    const [id] = await seed(1);
    const worker = buildProcessor();
    let claimedUntil = 0;
    let renewedUntil = 0;
    behaviour = async (context) => {
      claimedUntil = (
        await prisma.outboxEvent.findUniqueOrThrow({ where: { id } })
      ).availableAt.getTime();
      // Long enough that the renewal has to move the deadline, not merely
      // rewrite it with the same millisecond.
      await new Promise((resolve) => setTimeout(resolve, 50));
      await context.renewLease();
      renewedUntil = (
        await prisma.outboxEvent.findUniqueOrThrow({ where: { id } })
      ).availableAt.getTime();
    };

    await worker.processNext();

    expect(claimedUntil).toBeGreaterThan(0);
    expect(renewedUntil).toBeGreaterThan(claimedUntil);
  }, 120_000);

  it("lets another worker take over once a lease has genuinely expired", async () => {
    const [id] = await seed(1);
    const worker = buildProcessor();
    behaviour = async () => {
      throw new Error("worker died mid-delivery");
    };
    await worker.processNext();

    // The lease, not the backoff, is what a takeover waits for; the failure
    // path above already pushed availableAt out, so bring it back.
    await prisma.outboxEvent.update({
      where: { id },
      data: { availableAt: new Date(Date.now() - 1) },
    });
    behaviour = async () => undefined;
    await buildProcessor().processNext();

    expect(handled).toHaveLength(2);
    const event = await prisma.outboxEvent.findUniqueOrThrow({ where: { id } });
    expect(event.processedAt).not.toBeNull();
  }, 120_000);

  it("stops claiming an event that has exhausted its ten attempts", async () => {
    const [id] = await seed(1);
    await prisma.outboxEvent.update({
      where: { id },
      data: { attemptCount: 10 },
    });

    await buildProcessor().processNext();

    expect(handled).toHaveLength(0);
    const event = await prisma.outboxEvent.findUniqueOrThrow({ where: { id } });
    expect(event.processedAt).toBeNull();
    expect(event.attemptCount).toBe(10);
  }, 120_000);
});
