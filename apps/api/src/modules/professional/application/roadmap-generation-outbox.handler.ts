import { Injectable, OnModuleInit } from "@nestjs/common";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

import { ProfessionalRoadmapGenerationService } from "@professional/services/professional-roadmap-generation.service";
import {
  ROADMAP_GENERATION_EVENT,
  type RoadmapGenerationPayload,
} from "@professional/utils/professional.helper";

@Injectable()
export class RoadmapGenerationOutboxHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = ROADMAP_GENERATION_EVENT;
  readonly handlerName = "roadmap-generation-v1";

  constructor(
    private readonly generation: ProfessionalRoadmapGenerationService,
    private readonly registry: OutboxHandlerRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const { draftId } = payload as RoadmapGenerationPayload;
    await this.generation.runGeneration(draftId);
  }

  async abandon(payload: unknown) {
    const { draftId } = payload as RoadmapGenerationPayload;
    await this.generation.fail(
      draftId,
      ProfessionalMessageCode.ROADMAP_GENERATION_FAILED,
    );
  }
}
