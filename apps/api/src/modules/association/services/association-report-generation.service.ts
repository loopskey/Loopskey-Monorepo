import { HttpException, Inject, Injectable, Logger } from "@nestjs/common";
import { AssociationGeneratedReportState, Role } from "@prisma/client";
import { AssociationReportDatasetService } from "@association/services/association-report-dataset.service";
import { type ReportExportDocument } from "@association/types/association-report-export.types";
import { AssociationReportFormat } from "@prisma/client";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { writeReportWorkbook } from "@association/utils/association-report-excel.writer";
import { OBJECT_STORAGE } from "@infrastructure/storage/object-storage.port";
import { writeReportPdf } from "@association/utils/association-report-pdf.writer";
import { PrismaService } from "@prisma/prisma.service";

import * as E from "@association/utils/association-report-export.util";

const codeOf = (error: HttpException) => {
  const response = error.getResponse();
  if (typeof response === "object" && response !== null) {
    const code = (response as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return AssociationMessageCode.EXPORT_FAILED;
};

@Injectable()
export class AssociationReportGenerationService {
  private readonly logger = new Logger(AssociationReportGenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly datasets: AssociationReportDatasetService,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  private async logoBytes(storageKey: string | null) {
    if (!storageKey) return null;
    if (!(await this.storage.exists("logo", storageKey))) return null;

    try {
      return await this.storage.read("logo", storageKey);
    } catch {
      return null;
    }
  }

  async run(exportId: string) {
    const record = await this.prisma.associationGeneratedReport.findUnique({
      where: { id: exportId },
      include: {
        association: {
          select: { name: true, logoUrl: true, logoStorageKey: true },
        },
      },
    });

    if (!record) return;

    if (record.state !== AssociationGeneratedReportState.PENDING) {
      this.logger.log("Association report export already settled", {
        exportId,
        state: record.state,
      });
      return;
    }

    const started = Date.now();
    const locale = E.exportLocaleOf(record.locale);

    try {
      const dataset = await this.datasets.build(
        { id: record.requestedById, role: Role.ASSOCIATION },
        record.reportType,
        E.readExportFilter(record.filter),
        locale,
      );

      const document: ReportExportDocument = {
        locale,
        dataset,
        generatedAt: new Date(),
        associationName: record.association.name,
        associationLogoUrl: record.association.logoUrl,
        associationLogo: await this.logoBytes(
          record.association.logoStorageKey,
        ),
      };

      const file =
        record.format === AssociationReportFormat.PDF
          ? await writeReportPdf(document)
          : await writeReportWorkbook(document);

      await this.storage.store("report", record.storageKey, file);

      const settled = new Date();

      const { count } = await this.prisma.associationGeneratedReport.updateMany(
        {
          where: {
            id: exportId,
            state: AssociationGeneratedReportState.PENDING,
          },
          data: {
            readyAt: settled,
            failureReason: null,
            sizeBytes: file.byteLength,
            rowCount: dataset.rows.length,
            expiresAt: E.exportExpiresAt(settled),
            state: AssociationGeneratedReportState.READY,
          },
        },
      );

      if (count === 0) {
        this.logger.warn(
          "Association report export was settled by another run",
          {
            exportId,
          },
        );
        return;
      }

      this.logger.log("Association report export generated", {
        exportId,
        associationId: record.associationId,
        reportType: record.reportType,
        format: record.format,
        rows: dataset.rows.length,
        bytes: file.byteLength,
        durationMs: Date.now() - started,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        await this.fail(exportId, codeOf(error));
        return;
      }

      throw error;
    }
  }

  async fail(exportId: string, reason: string) {
    const { count } = await this.prisma.associationGeneratedReport.updateMany({
      where: { id: exportId, state: AssociationGeneratedReportState.PENDING },
      data: {
        failureReason: reason,
        state: AssociationGeneratedReportState.FAILED,
      },
    });

    if (count === 0) return;

    const record = await this.prisma.associationGeneratedReport.findUnique({
      where: { id: exportId },
      select: { storageKey: true },
    });

    if (record) await this.storage.remove("report", record.storageKey);

    this.logger.warn("Association report export failed", { exportId, reason });
  }
}
