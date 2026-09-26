import { AssociationReportGenerationService } from "@association/services/association-report-generation.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { REPORT_EXPORT_EVENT } from "@association/services/association-report-export.service";

import { type ReportExportPayload } from "@association/types/association-report-export.types";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

@Injectable()
export class AssociationReportExportHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = REPORT_EXPORT_EVENT;
  readonly handlerName = "association-report-export-v1";
  readonly lane = "realtime" as const;

  constructor(
    private readonly registry: OutboxHandlerRegistry,
    private readonly generation: AssociationReportGenerationService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const { exportId } = payload as ReportExportPayload;
    await this.generation.run(exportId);
  }

  async abandon(payload: unknown) {
    const { exportId } = payload as ReportExportPayload;
    await this.generation.fail(exportId, AssociationMessageCode.EXPORT_FAILED);
  }
}
