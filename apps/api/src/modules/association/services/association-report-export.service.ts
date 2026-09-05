import { AssociationGeneratedReportState, Prisma, Role } from "@prisma/client";
import { type AssociationGeneratedReport } from "@prisma/client";
import { ConflictException, GoneException } from "@nestjs/common";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationReportService } from "@association/services/association-report.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type ReportExportRequest } from "@association/types/association-report-export.types";
import { type ReportExportPayload } from "@association/types/association-report-export.types";
import { type TAssociationUser } from "@association/types/association-service.types";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { OBJECT_STORAGE } from "@infrastructure/storage/object-storage.port";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { requestContext } from "@infrastructure/observability/request-context";

import * as E from "@association/utils/association-report-export.util";

export const REPORT_EXPORT_EVENT = "association.report-export.requested.v1";

export const REPORT_EXPORT_AGGREGATE = "AssociationGeneratedReport";

const DEFAULT_TAKE = 20;

const MAX_TAKE = 50;

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

export type ReportExportPage = { take?: number | null; cursor?: string | null };

@Injectable()
export class AssociationReportExportService {
  private readonly logger = new Logger(AssociationReportExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    private readonly reports: AssociationReportService,
    private readonly outbox: OutboxService,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  async request(user: TAssociationUser, input: ReportExportRequest) {
    const association = await this.access.requireOwned(user);
    const filter = E.normalizeExportFilter(input.filter);

    await this.reports.assertFilterUsable(user, filter);

    const now = new Date();
    const filterHash = E.exportFilterHash(filter);

    const data = {
      associationId: association.id,
      requestedById: user.id,
      reportType: input.reportType,
      format: input.format,
      filter: filter as unknown as Prisma.InputJsonValue,
      filterHash,
      locale: E.exportLocaleOf(input.locale),
      storageKey: E.exportStorageKey(input.format),
      fileName: E.exportFileName(input.reportType, input.format, now),
      mimeType: E.exportMimeType(input.format),
    };

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const record = await tx.associationGeneratedReport.create({ data });
        await this.appendRequest(record.id, tx);
        return record;
      });

      this.logger.log("Association report export requested", {
        exportId: created.id,
        associationId: association.id,
        reportType: created.reportType,
        format: created.format,
      });

      return this.present(created);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;

      const pending = await this.prisma.associationGeneratedReport.findFirst({
        where: {
          filterHash,
          format: input.format,
          reportType: input.reportType,
          associationId: association.id,
          state: AssociationGeneratedReportState.PENDING,
        },
      });

      if (!pending) throw error;

      this.logger.warn(
        "Association report export request joined a pending one",
        {
          exportId: pending.id,
          associationId: association.id,
          reportType: pending.reportType,
          format: pending.format,
        },
      );

      return this.present(pending);
    }
  }

  async retry(user: TAssociationUser, exportId: string) {
    const record = await this.requireOwn(user, exportId);

    if (record.state === AssociationGeneratedReportState.EXPIRED)
      return this.request(user, {
        format: record.format,
        reportType: record.reportType,
        locale: record.locale,
        filter: E.readExportFilter(record.filter),
      });

    if (record.state !== AssociationGeneratedReportState.FAILED)
      return this.present(record);

    try {
      const moved = await this.prisma.$transaction(async (tx) => {
        const { count } = await tx.associationGeneratedReport.updateMany({
          where: {
            id: record.id,
            state: AssociationGeneratedReportState.FAILED,
          },
          data: {
            failureReason: null,
            state: AssociationGeneratedReportState.PENDING,
          },
        });

        if (count === 0) return false;

        await this.appendRequest(record.id, tx);
        return true;
      });

      if (moved)
        this.logger.log("Association report export retried", {
          exportId: record.id,
          associationId: record.associationId,
        });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;

      this.logger.warn("Association report export retry joined a pending one", {
        exportId: record.id,
        associationId: record.associationId,
      });
    }

    return this.present(await this.requireOwn(user, exportId));
  }

  async list(
    user: TAssociationUser,
    page?: ReportExportPage,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);
    const take = Math.min(page?.take ?? DEFAULT_TAKE, MAX_TAKE);
    const cursor = page?.cursor ?? null;

    const where = { associationId: association.id };

    const [items, totalCount] = await Promise.all([
      this.prisma.associationGeneratedReport.findMany({
        where,
        take: take + 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.associationGeneratedReport.count({ where }),
    ]);

    const hasNextPage = items.length > take;
    const rows = hasNextPage ? items.slice(0, take) : items;

    return {
      totalCount,
      items: rows.map((row) => this.present(row)),
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (rows.at(-1)?.id ?? null) : null,
      },
    };
  }

  async findOne(
    user: TAssociationUser,
    exportId: string,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);

    const record = await this.prisma.associationGeneratedReport.findFirst({
      where: { id: exportId, associationId: association.id },
    });

    if (!record) throw this.notFound();

    return this.present(record);
  }

  async downloadable(user: TAssociationUser, exportId: string) {
    if (user.role !== Role.ASSOCIATION) throw this.notFound();

    const record = await this.requireOwn(user, exportId);

    if (record.state === AssociationGeneratedReportState.PENDING)
      throw new ConflictException({
        code: AssociationMessageCode.EXPORT_NOT_READY,
        message: "That export is still being generated.",
      });

    if (record.state === AssociationGeneratedReportState.FAILED)
      throw new ConflictException({
        code: AssociationMessageCode.EXPORT_FAILED,
        message: "That export could not be generated.",
      });

    if (record.state === AssociationGeneratedReportState.EXPIRED)
      throw this.expired();

    if (!(await this.storage.exists("report", record.storageKey)))
      throw this.expired();

    this.logger.log("Association report export downloaded", {
      exportId: record.id,
      associationId: record.associationId,
    });

    return {
      fileName: record.fileName,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes ?? 0,
      filePath: this.storage.resolve("report", record.storageKey),
    };
  }

  private present(record: AssociationGeneratedReport) {
    return {
      id: record.id,
      state: record.state,
      format: record.format,
      rowCount: record.rowCount,
      readyAt: record.readyAt,
      fileName: record.fileName,
      sizeBytes: record.sizeBytes,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      reportType: record.reportType,
      failureReason: record.failureReason,
      filter: E.readExportFilter(record.filter),
    };
  }

  private async requireOwn(user: TAssociationUser, exportId: string) {
    const association = await this.access.requireOwned(user);

    const record = await this.prisma.associationGeneratedReport.findFirst({
      where: { id: exportId, associationId: association.id },
    });

    if (!record) throw this.notFound();

    return record;
  }

  private appendRequest(exportId: string, writer: Prisma.TransactionClient) {
    return this.outbox.append(
      {
        eventName: REPORT_EXPORT_EVENT,
        aggregateId: exportId,
        aggregateType: REPORT_EXPORT_AGGREGATE,
        correlationId: requestContext.correlationId() ?? undefined,
        payload: { exportId } satisfies ReportExportPayload,
      },
      writer,
    );
  }

  private notFound() {
    return new NotFoundException({
      code: AssociationMessageCode.EXPORT_NOT_FOUND,
      message: "Export not found.",
    });
  }

  private expired() {
    return new GoneException({
      code: AssociationMessageCode.EXPORT_EXPIRED,
      message: "That export has expired. Generate it again.",
    });
  }
}
