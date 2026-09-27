import { Injectable, OnModuleInit } from "@nestjs/common";
import { AssociationLearningContentRecipientService } from "@association/services/association-learning-content-recipient.service";
import { LEARNING_CONTENT_AUDIENCE_CHANGED_EVENT } from "@association/services/association-learning-content-recipient.service";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";

import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

type LearningContentAudiencePayload = { learningContentId: string };

@Injectable()
export class AssociationLearningContentAudienceHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = LEARNING_CONTENT_AUDIENCE_CHANGED_EVENT;
  readonly handlerName = "association-learning-content-audience-v1";
  readonly lane = "realtime" as const;

  constructor(
    private readonly registry: OutboxHandlerRegistry,
    private readonly recipients: AssociationLearningContentRecipientService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown, event: OutboxEventContext) {
    const { learningContentId } = payload as LearningContentAudiencePayload;
    await this.recipients.syncContent(learningContentId, event.renewLease);
  }
}
