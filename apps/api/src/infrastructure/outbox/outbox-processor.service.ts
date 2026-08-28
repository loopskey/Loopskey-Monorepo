import { Injectable, OnModuleInit } from "@nestjs/common";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxDeferral } from "@infrastructure/outbox/outbox-handler.port";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma } from "@prisma/client";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const MAX_ATTEMPTS = 10;
const DEFAULT_LEASE_MS = 60_000;

/**
 * The key an external provider sees. Derived from the outbox event id, so every
 * attempt at the same event presents the same key and a provider that honours
 * idempotency collapses them into one side effect.
 */
export const outboxIdempotencyKey = (eventId: string) => `outbox-${eventId}`;

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessor.name);
  private timer?: NodeJS.Timeout;
  private running = false;
  private leaseMs = DEFAULT_LEASE_MS;

  constructor(
    private readonly prisma: PrismaService,
    private readonly handlers: OutboxHandlerRegistry,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    // A handler that can legitimately outrun the default lease gets a longer
    // one from configuration rather than a race with the next worker.
    const configuredLease = Number(
      this.config.get("OUTBOX_LEASE_MS", String(DEFAULT_LEASE_MS)),
    );
    this.leaseMs =
      Number.isFinite(configuredLease) && configuredLease > 0
        ? configuredLease
        : DEFAULT_LEASE_MS;
    const interval = Number(this.config.get("OUTBOX_POLL_INTERVAL_MS", "1000"));
    this.timer = setInterval(() => this.tick(), interval);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private tick() {
    if (this.running) return;
    this.running = true;
    void this.processNext()
      .catch((error: unknown) => {
        this.logger.error("Outbox poll failed", {
          errorName: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      })
      .finally(() => {
        this.running = false;
      });
  }

  /**
   * Extend a claim that is still being worked on.
   *
   * Conditional on the event still being unprocessed, so a renewal cannot
   * resurrect an event another path has already finished.
   */
  private async renewLease(eventId: string) {
    const { count } = await this.prisma.outboxEvent.updateMany({
      where: { id: eventId, processedAt: null },
      data: { availableAt: new Date(Date.now() + this.leaseMs) },
    });
    if (count === 1) return;
    this.logger.warn("Outbox lease renewal found no claimable event", {
      eventId,
    });
  }

  async processNext() {
    const now = new Date();
    const event = await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "OutboxEvent"
        WHERE "processedAt" IS NULL AND "availableAt" <= ${now}
          AND "attemptCount" < ${MAX_ATTEMPTS}
        ORDER BY "occurredAt" ASC
        FOR UPDATE SKIP LOCKED LIMIT 1`;
      if (!rows[0]) return null;
      return tx.outboxEvent.update({
        where: { id: rows[0].id },
        data: {
          attemptCount: { increment: 1 },
          availableAt: new Date(now.getTime() + this.leaseMs),
        },
      });
    });
    if (!event) return false;

    const context: OutboxEventContext = {
      id: event.id,
      eventName: event.eventName,
      attemptCount: event.attemptCount,
      correlationId: event.correlationId,
      idempotencyKey: outboxIdempotencyKey(event.id),
      renewLease: () => this.renewLease(event.id),
    };

    try {
      const handler = this.handlers.resolve(event.eventName);
      if (!handler)
        throw new Error(
          `No handler for ${event.eventName}@${event.eventVersion}`,
        );
      const delivered = await this.prisma.outboxDelivery.findUnique({
        where: {
          eventId_handlerName: {
            eventId: event.id,
            handlerName: handler.handlerName,
          },
        },
      });
      if (!delivered) {
        // The window between the side effect and the delivery row is the one
        // place a crash can duplicate work. It is not closable — the side
        // effect is outside the database — so it is made harmless instead: the
        // idempotency key above is what a redelivery presents to the provider.
        await handler.handle(event.payload, context);
        await this.prisma.outboxDelivery
          .create({
            data: { eventId: event.id, handlerName: handler.handlerName },
          })
          .catch((error: unknown) => {
            if (!isUniqueViolation(error)) throw error;
            this.logger.warn("Outbox delivery already recorded", {
              eventId: event.id,
              handlerName: handler.handlerName,
              correlationId: event.correlationId,
            });
          });
      }
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date(), lastError: null },
      });
      this.logger.log("Outbox event processed", {
        eventId: event.id,
        eventName: event.eventName,
        correlationId: event.correlationId,
      });
    } catch (error) {
      // A handler that named its own wait gets exactly that wait. Everything
      // else backs off exponentially.
      const delay =
        error instanceof OutboxDeferral
          ? error.seconds * 1000
          : Math.min(3_600_000, 2 ** event.attemptCount * 1000);
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          availableAt: new Date(Date.now() + delay),
          lastError:
            error instanceof Error
              ? error.message.slice(0, 1000)
              : "Unknown error",
        },
      });
      if (error instanceof OutboxDeferral) {
        this.logger.warn("Outbox attempt deferred", {
          eventId: event.id,
          seconds: error.seconds,
          correlationId: event.correlationId,
        });
        return true;
      }
      this.logger.error("Outbox attempt failed", {
        eventId: event.id,
        attempt: event.attemptCount,
        correlationId: event.correlationId,
      });
      if (event.attemptCount >= MAX_ATTEMPTS) {
        this.logger.error("Outbox event abandoned after final attempt", {
          eventId: event.id,
          eventName: event.eventName,
          attempts: event.attemptCount,
          correlationId: event.correlationId,
        });
        // The domain gets the last word: an abandoned event must leave
        // something the professional can see and act on, not a silent stall.
        await this.handlers
          .resolve(event.eventName)
          ?.abandon?.(event.payload, context)
          .catch((abandonError: unknown) => {
            this.logger.error("Outbox abandonment hook failed", {
              eventId: event.id,
              correlationId: event.correlationId,
              message:
                abandonError instanceof Error
                  ? abandonError.message
                  : "Unknown error",
            });
          });
      }
    }
    return true;
  }
}
