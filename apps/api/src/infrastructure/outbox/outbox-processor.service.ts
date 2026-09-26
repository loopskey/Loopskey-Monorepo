import { Injectable, OnModuleInit } from "@nestjs/common";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxLane } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxDeferral } from "@infrastructure/outbox/outbox-handler.port";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma } from "@prisma/client";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const MAX_ATTEMPTS = 10;
const DEFAULT_LEASE_MS = 60_000;

export const REALTIME_OUTBOX_PROCESSOR = "REALTIME_OUTBOX_PROCESSOR";
export const BULK_OUTBOX_PROCESSOR = "BULK_OUTBOX_PROCESSOR";

export const outboxIdempotencyKey = (eventId: string) => `outbox-${eventId}`;

export type OutboxProcessorOptions = {
  readonly lane?: OutboxLane;
  readonly leaseConfigKey?: string;
  readonly pollIntervalConfigKey?: string;
};

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private timer?: NodeJS.Timeout;
  private running = false;
  private leaseMs = DEFAULT_LEASE_MS;

  constructor(
    private readonly prisma: PrismaService,
    private readonly handlers: OutboxHandlerRegistry,
    private readonly config: ConfigService,
    private readonly options: OutboxProcessorOptions = {},
  ) {
    this.logger = new Logger(
      options.lane
        ? `${OutboxProcessor.name}:${options.lane}`
        : OutboxProcessor.name,
    );
  }

  onModuleInit() {
    const leaseKey = this.options.leaseConfigKey ?? "OUTBOX_LEASE_MS";
    const configuredLease = Number(
      this.config.get(leaseKey, String(DEFAULT_LEASE_MS)),
    );
    this.leaseMs =
      Number.isFinite(configuredLease) && configuredLease > 0
        ? configuredLease
        : DEFAULT_LEASE_MS;
    const intervalKey =
      this.options.pollIntervalConfigKey ?? "OUTBOX_POLL_INTERVAL_MS";
    const interval = Number(this.config.get(intervalKey, "1000"));
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
    const laneEventNames = this.options.lane
      ? this.handlers.eventNamesForLane(this.options.lane)
      : null;
    if (laneEventNames && laneEventNames.length === 0) return false;

    const now = new Date();
    const event = await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "OutboxEvent"
        WHERE "processedAt" IS NULL AND "availableAt" <= ${now}
          AND "attemptCount" < ${MAX_ATTEMPTS}
          ${
            laneEventNames
              ? Prisma.sql`AND "eventName" IN (${Prisma.join(laneEventNames)})`
              : Prisma.empty
          }
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
