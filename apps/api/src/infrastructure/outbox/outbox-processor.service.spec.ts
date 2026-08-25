import { OutboxProcessor } from "@infrastructure/outbox/outbox-processor.service";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";

import {
  OutboxDeferral,
  OutboxHandlerRegistry,
} from "@infrastructure/outbox/outbox-handler.port";

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.11.1",
  });

const buildEvent = (overrides: Record<string, unknown> = {}) => ({
  id: "evt-1",
  eventName: "mail.delivery.requested",
  eventVersion: 1,
  attemptCount: 1,
  correlationId: "corr-1",
  payload: { to: "ops@example.test", subject: "Hi", html: "<p>Hi</p>" },
  ...overrides,
});

type Harness = {
  processor: OutboxProcessor;
  prisma: {
    $transaction: jest.Mock;
    outboxDelivery: { findUnique: jest.Mock; create: jest.Mock };
    outboxEvent: { update: jest.Mock };
    auditLog: { create: jest.Mock };
  };
  mail: { deliver: jest.Mock };
  abandon: jest.Mock;
};

/**
 * The mail path is exercised through a registered handler rather than a branch
 * inside the processor, which is what the processor now actually does.
 */
const buildHarness = (event: unknown): Harness => {
  const prisma = {
    $transaction: jest.fn().mockResolvedValue(event),
    outboxDelivery: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    outboxEvent: { update: jest.fn().mockResolvedValue({}) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };
  const mail = { deliver: jest.fn().mockResolvedValue({ id: "sent" }) };
  const abandon = jest.fn().mockResolvedValue(undefined);
  const registry = new OutboxHandlerRegistry();
  registry.register({
    eventName: "mail.delivery.requested",
    handlerName: "mail-v1",
    handle: (payload: unknown) => mail.deliver(payload),
    abandon,
  });
  const processor = new OutboxProcessor(
    prisma as unknown as PrismaService,
    registry,
    { get: (_k: string, d?: string) => d } as unknown as ConfigService,
  );
  return { processor, prisma, mail, abandon };
};

describe("OutboxProcessor", () => {
  afterEach(() => jest.restoreAllMocks());

  it("delivers a claimed mail event and marks it processed", async () => {
    const { processor, prisma, mail } = buildHarness(buildEvent());

    await processor.processNext();

    expect(mail.deliver).toHaveBeenCalledTimes(1);
    expect(prisma.outboxDelivery.create).toHaveBeenCalledTimes(1);
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastError: null }),
      }),
    );
  });

  it("does not redeliver when the handler already recorded a delivery", async () => {
    const { processor, prisma, mail } = buildHarness(buildEvent());
    prisma.outboxDelivery.findUnique.mockResolvedValue({ eventId: "evt-1" });

    await processor.processNext();

    expect(mail.deliver).not.toHaveBeenCalled();
  });

  /**
   * Regression: a concurrent worker inserting the same delivery row surfaced as
   * a unique-constraint error, which the catch block recorded as a failed
   * attempt and rescheduled — turning a benign race into a redelivery.
   */
  it("treats a concurrent delivery insert as success, not a failed attempt", async () => {
    const { processor, prisma } = buildHarness(buildEvent());
    prisma.outboxDelivery.create.mockRejectedValue(uniqueViolation());

    await processor.processNext();

    const updates = prisma.outboxEvent.update.mock.calls.map(
      (call) => call[0].data,
    );
    expect(updates).toHaveLength(1);
    expect(updates[0]).toEqual(
      expect.objectContaining({
        lastError: null,
        processedAt: expect.any(Date),
      }),
    );
  });

  it("records a real delivery failure with backoff", async () => {
    const { processor, prisma, mail } = buildHarness(buildEvent());
    mail.deliver.mockRejectedValue(new Error("provider down"));

    await processor.processNext();

    const data = prisma.outboxEvent.update.mock.calls[0][0].data;
    expect(data.lastError).toContain("provider down");
    expect(data.availableAt).toBeInstanceOf(Date);
  });

  it("logs an abandonment when the final attempt fails", async () => {
    const { processor, mail } = buildHarness(buildEvent({ attemptCount: 10 }));
    mail.deliver.mockRejectedValue(new Error("provider down"));
    const errors: string[] = [];
    jest
      .spyOn(processor["logger"], "error")
      .mockImplementation((message: unknown) => {
        errors.push(String(message));
      });

    await processor.processNext();

    expect(errors).toContain("Outbox event abandoned after final attempt");
  });

  it("waits exactly as long as a handler asked rather than backing off", async () => {
    const { processor, prisma, mail } = buildHarness(buildEvent());
    mail.deliver.mockRejectedValue(new OutboxDeferral(120, "at capacity"));
    const before = Date.now();

    await processor.processNext();

    const data = prisma.outboxEvent.update.mock.calls[0][0].data;
    const waited = (data.availableAt as Date).getTime() - before;
    // Exponential backoff for attempt 1 would be ~2s, so this proves the
    // handler's own wait won rather than the processor's default.
    expect(waited).toBeGreaterThanOrEqual(119_000);
  });

  it("does not abandon an event that still has attempts left", async () => {
    const { processor, mail, abandon } = buildHarness(buildEvent());
    mail.deliver.mockRejectedValue(new Error("provider down"));

    await processor.processNext();

    expect(abandon).not.toHaveBeenCalled();
  });

  it("gives the handler the last word when the event is abandoned", async () => {
    const { processor, mail, abandon } = buildHarness(
      buildEvent({ attemptCount: 10 }),
    );
    mail.deliver.mockRejectedValue(new Error("provider down"));

    await processor.processNext();

    expect(abandon).toHaveBeenCalledTimes(1);
  });

  it("records a failure when no handler claims the event", async () => {
    const { processor, prisma } = buildHarness(
      buildEvent({ eventName: "nobody.listens" }),
    );

    await processor.processNext();

    const data = prisma.outboxEvent.update.mock.calls[0][0].data;
    expect(data.lastError).toContain("No handler for nobody.listens");
  });

  it("reports no work when nothing is claimable", async () => {
    const { processor, mail } = buildHarness(null);

    await expect(processor.processNext()).resolves.toBe(false);
    expect(mail.deliver).not.toHaveBeenCalled();
  });

  describe("timer safety", () => {
    /**
     * Regression: the poll callback was `() => void this.processNext()`, so a
     * failure in the claim query — a missing OutboxEvent table, for instance —
     * became an unhandled rejection and terminated the API process.
     */
    it("swallows and logs a claim failure instead of rejecting", async () => {
      const { processor, prisma } = buildHarness(buildEvent());
      prisma.$transaction.mockRejectedValue(
        new Error('relation "OutboxEvent" does not exist'),
      );
      const errors: string[] = [];
      jest
        .spyOn(processor["logger"], "error")
        .mockImplementation((message: unknown) => {
          errors.push(String(message));
        });

      const rejections: unknown[] = [];
      const onRejection = (reason: unknown) => rejections.push(reason);
      process.on("unhandledRejection", onRejection);

      processor["tick"]();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
      process.off("unhandledRejection", onRejection);

      expect(rejections).toEqual([]);
      expect(errors).toContain("Outbox poll failed");
    });

    /**
     * Regression: `setInterval` fires on schedule regardless of how long a
     * delivery takes, so overlapping ticks could claim and send the same event
     * twice.
     */
    it("does not start a second tick while one is in flight", async () => {
      const { processor, prisma } = buildHarness(buildEvent());
      let release: (() => void) | undefined;
      prisma.$transaction.mockImplementation(
        () => new Promise((resolve) => (release = () => resolve(null))),
      );

      processor["tick"]();
      processor["tick"]();
      processor["tick"]();

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);

      release?.();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));

      processor["tick"]();
      expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    });
  });
});
