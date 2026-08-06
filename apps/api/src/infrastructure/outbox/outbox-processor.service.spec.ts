import { OutboxProcessor } from "@infrastructure/outbox/outbox-processor.service";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { Prisma } from "@prisma/client";

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
};

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
  const processor = new OutboxProcessor(
    prisma as unknown as PrismaService,
    mail as unknown as MailService,
    { get: (_k: string, d?: string) => d } as unknown as ConfigService,
  );
  return { processor, prisma, mail };
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
