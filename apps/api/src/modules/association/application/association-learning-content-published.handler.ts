import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { LEARNING_CONTENT_PUBLISHED_EVENT } from "@association/services/association-learning-content.service";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";

import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

type LearningContentPublishedPayload = {
  learningContentId: string;
  associationId: string;
};

@Injectable()
export class AssociationLearningContentPublishedHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = LEARNING_CONTENT_PUBLISHED_EVENT;
  readonly handlerName = "association-learning-content-published-v1";

  private readonly logger = new Logger(
    AssociationLearningContentPublishedHandler.name,
  );

  constructor(private readonly registry: OutboxHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const event = payload as LearningContentPublishedPayload;
    this.logger.log("Association learning content published event observed", {
      learningContentId: event.learningContentId,
      associationId: event.associationId,
    });
  }
}
