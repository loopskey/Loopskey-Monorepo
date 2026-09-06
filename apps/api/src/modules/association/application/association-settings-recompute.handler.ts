import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { SETTINGS_RECOMPUTE_EVENT } from "@association/services/association-settings.service";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

type SettingsRecomputePayload = { associationId: string };

@Injectable()
export class AssociationSettingsRecomputeHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = SETTINGS_RECOMPUTE_EVENT;
  readonly handlerName = "association-settings-recompute-v1";

  private readonly logger = new Logger(
    AssociationSettingsRecomputeHandler.name,
  );

  constructor(
    private readonly registry: OutboxHandlerRegistry,
    private readonly compliance: AssociationComplianceService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const event = payload as SettingsRecomputePayload;

    const outcome = await this.compliance.recomputeAssociation(
      event.associationId,
    );

    this.logger.log("Association reclassified after a threshold change", {
      associationId: event.associationId,
      assignments: outcome.assignments,
      discarded: outcome.discarded,
    });
  }
}
