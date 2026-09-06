import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { REQUIREMENT_PUBLISHED_EVENT } from "@association/services/association-requirement.service";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

type RequirementPublishedPayload = {
  requirementId: string;
  associationId: string;
};

@Injectable()
export class AssociationRequirementPublishedHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = REQUIREMENT_PUBLISHED_EVENT;
  readonly handlerName = "association-requirement-published-v1";

  private readonly logger = new Logger(
    AssociationRequirementPublishedHandler.name,
  );

  constructor(private readonly registry: OutboxHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const event = payload as RequirementPublishedPayload;
    this.logger.log("Association requirement published event observed", {
      requirementId: event.requirementId,
      associationId: event.associationId,
    });
  }
}
