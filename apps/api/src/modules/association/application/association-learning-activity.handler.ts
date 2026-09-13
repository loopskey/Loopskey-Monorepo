import { type LearningActivityChangedPayload } from "@professional/public/professional-compliance-api.events";
import { LEARNING_ACTIVITY_CHANGED_EVENT } from "@professional/public/professional-compliance-api.events";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

@Injectable()
export class AssociationLearningActivityHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = LEARNING_ACTIVITY_CHANGED_EVENT;
  readonly handlerName = "association-learning-activity-v2";

  private readonly logger = new Logger(AssociationLearningActivityHandler.name);

  constructor(
    private readonly registry: OutboxHandlerRegistry,
    private readonly compliance: AssociationComplianceService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const event = payload as LearningActivityChangedPayload;
    if (!event?.userId) return;
    const outcome = await this.compliance.recomputeForUser(event.userId);

    this.logger.log("Association compliance recomputed from activity event", {
      activityId: event.activityId,
      changeKind: event.changeKind,
      revision: event.revision,
      assignments: outcome.assignments,
    });
  }
}
