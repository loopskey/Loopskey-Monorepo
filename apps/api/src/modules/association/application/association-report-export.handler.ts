import { Injectable, OnModuleInit } from "@nestjs/common";
import { AssociationReportGenerationService } from "@association/services/association-report-generation.service";
import { REPORT_EXPORT_EVENT } from "@association/services/association-report-export.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type ReportExportPayload } from "@association/types/association-report-export.types";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

@Injectable()
export class AssociationReportExportHandler
  implements OutboxHandler, OnModuleInit
{
  readonly eventName = REPORT_EXPORT_EVENT;
  readonly handlerName = "association-report-export-v1";

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
