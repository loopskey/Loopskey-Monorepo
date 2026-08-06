import { Injectable, OnModuleInit } from "@nestjs/common";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { TSendEmailInput } from "@mail/mail-service.type";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { MailService } from "@mail/mail.service";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

type AuditPayload = {
  actorId?: string;
  entityId?: string;
  entityType?: string;
  action: AuditAction;
  metadata?: Prisma.InputJsonValue;
};

const MAX_ATTEMPTS = 10;
const LEASE_MS = 60_000;

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessor.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
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
          availableAt: new Date(now.getTime() + LEASE_MS),
        },
      });
    });
    if (!event) return false;

    try {
      const handlerName =
        event.eventName === "mail.delivery.requested"
          ? "mail-v1"
          : event.eventName === "audit.record.requested"
            ? "audit-v1"
            : null;
      if (!handlerName)
        throw new Error(
          `No handler for ${event.eventName}@${event.eventVersion}`,
        );
      const delivered = await this.prisma.outboxDelivery.findUnique({
        where: { eventId_handlerName: { eventId: event.id, handlerName } },
      });
      if (!delivered) {
        if (event.eventName === "mail.delivery.requested")
          await this.mail.deliver(event.payload as TSendEmailInput);
        else {
          const payload = event.payload as AuditPayload;
          await this.prisma.auditLog.create({
            data: {
              action: payload.action,
              actorId: payload.actorId,
              entityType: payload.entityType,
              entityId: payload.entityId,
              metadata: payload.metadata,
            },
          });
        }
        await this.prisma.outboxDelivery
          .create({ data: { eventId: event.id, handlerName } })
          .catch((error: unknown) => {
            if (!isUniqueViolation(error)) throw error;
            this.logger.warn("Outbox delivery already recorded", {
              eventId: event.id,
              handlerName,
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
      const delay = Math.min(3_600_000, 2 ** event.attemptCount * 1000);
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
      }
    }
    return true;
  }
}
