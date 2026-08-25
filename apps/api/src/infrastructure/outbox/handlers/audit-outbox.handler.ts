import { Injectable, OnModuleInit } from "@nestjs/common";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { AuditAction, Prisma } from "@prisma/client";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";
import { PrismaService } from "@prisma/prisma.service";

type AuditPayload = {
  actorId?: string;
  entityId?: string;
  entityType?: string;
  action: AuditAction;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditOutboxHandler implements OutboxHandler, OnModuleInit {
  readonly eventName = "audit.record.requested";
  readonly handlerName = "audit-v1";

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: OutboxHandlerRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const audit = payload as AuditPayload;
    await this.prisma.auditLog.create({
      data: {
        action: audit.action,
        actorId: audit.actorId,
        entityType: audit.entityType,
        entityId: audit.entityId,
        metadata: audit.metadata,
      },
    });
  }
}
