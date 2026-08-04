import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

export type OutboxWriter =
  | Pick<PrismaClient, "outboxEvent">
  | Prisma.TransactionClient;

export type AppendOutboxEvent = {
  eventName: string;
  aggregateId: string;
  eventVersion?: number;
  aggregateType: string;
  correlationId?: string;
  payload: Prisma.InputJsonValue;
};

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}
  append(event: AppendOutboxEvent, writer: OutboxWriter = this.prisma) {
    return writer.outboxEvent.create({
      data: {
        ...event,
        eventVersion: event.eventVersion ?? 1,
        correlationId: event.correlationId ?? null,
      },
    });
  }
}
