import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { NotFoundException, PayloadTooLargeException } from "@nestjs/common";
import { IngestionBatchMode, IngestionBatchStatus } from "@prisma/client";
import { IngestionContentKind, Prisma } from "@prisma/client";
import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import {
  buildKindReceipt,
  isUniqueViolation,
  kindReportJson,
  storedKindReceipt,
} from "@ingestion/utils/ingestion-batch.util";

import type { KindIngestionHandler } from "@ingestion/types/kind-ingestion.types";
import type { KindIngestionItemReport } from "@ingestion/types/kind-ingestion.types";
import type { KindIngestionReceipt } from "@ingestion/types/kind-ingestion.types";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

type ParsedEnvelope = {
  dryRun: boolean;
  items: unknown[];
  mode: IngestionBatchMode;
};

type RawEnvelope = {
  kind?: unknown;
  mode?: unknown;
  items?: unknown;
  dryRun?: unknown;
  contractVersion?: unknown;
};

export type RunBatchInput<TCanonical> = {
  handler: KindIngestionHandler<TCanonical>;
  source: TIngestionSourceContext;
  envelope: RawEnvelope;
  idempotencyKey?: string;
  contentLength?: string;
};

/**
 * The kind-agnostic half of phase 03's course ingestion service: it validates
 * the envelope, claims the batch idempotently, runs the per-item loop, keeps
 * the batch report current, and builds the receipt. Everything catalog-specific
 * is delegated to the kind's `KindIngestionHandler`. Phase 03's
 * `CourseIngestionService` is deliberately left untouched and keeps its own
 * copy of this flow.
 */
@Injectable()
export class IngestionBatchRunnerService {
  private readonly logger = new Logger(IngestionBatchRunnerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async run<TCanonical>(
    input: RunBatchInput<TCanonical>,
  ): Promise<KindIngestionReceipt> {
    const { handler, source } = input;
    const startedAt = Date.now();

    this.validateContentLength(input.contentLength, handler.bodyLimitBytes);
    const idempotencyKey = this.validateIdempotencyKey(
      input.idempotencyKey,
      handler.idempotencyKeyLimit,
    );
    const envelope = this.parseEnvelope(input.envelope, source, handler);
    const fieldMap = this.resolveFieldMap(handler, source.fieldMap);

    if (envelope.dryRun) {
      const reports = await Promise.all(
        envelope.items.map((rawItem) =>
          handler.preview(source, handler.prepare(rawItem, fieldMap, true)),
        ),
      );
      const receipt = buildKindReceipt({
        batchId: null,
        dryRun: true,
        mode: envelope.mode,
        status: "DRY_RUN",
        reports,
      });
      this.logBatch(handler.kind, source.sourceSlug, receipt, startedAt);
      return receipt;
    }

    const claimed = await this.claimBatch({
      sourceId: source.sourceId,
      idempotencyKey,
      mode: envelope.mode,
      receivedCount: envelope.items.length,
    });
    if (!claimed.isNew) return storedKindReceipt(claimed.batch);

    const reports: KindIngestionItemReport[] = [];
    try {
      for (const rawItem of envelope.items) {
        const prepared = handler.prepare(rawItem, fieldMap, false);
        let report: KindIngestionItemReport;
        try {
          report =
            prepared.outcome === "accepted"
              ? await handler.persistAccepted({
                  source,
                  batchId: claimed.batch.id,
                  prepared,
                  priorReports: reports,
                  recordProgress: (tx, all) =>
                    this.recordProgress(tx, claimed.batch.id, all),
                })
              : await handler.persistRejected({
                  source,
                  batchId: claimed.batch.id,
                  prepared,
                  priorReports: reports,
                  recordProgress: (tx, all) =>
                    this.recordProgress(tx, claimed.batch.id, all),
                });
        } catch {
          report = await this.persistUnrecoverableRejection(
            claimed.batch.id,
            prepared.externalId,
            prepared.unmappedFields,
            reports,
          );
        }
        reports.push(report);
      }

      await this.prisma.ingestionBatch.update({
        where: { id: claimed.batch.id },
        data: { status: IngestionBatchStatus.COMPLETED },
      });
      const receipt = buildKindReceipt({
        batchId: claimed.batch.id,
        dryRun: false,
        mode: envelope.mode,
        status: IngestionBatchStatus.COMPLETED,
        reports,
      });
      this.logBatch(handler.kind, source.sourceSlug, receipt, startedAt);
      return receipt;
    } catch (error) {
      await this.prisma.ingestionBatch.updateMany({
        where: {
          id: claimed.batch.id,
          status: IngestionBatchStatus.PROCESSING,
        },
        data: { status: IngestionBatchStatus.FAILED },
      });
      throw error;
    }
  }

  private resolveFieldMap<TCanonical>(
    handler: KindIngestionHandler<TCanonical>,
    rawFieldMap: unknown,
  ) {
    try {
      return handler.resolveFieldMap(rawFieldMap);
    } catch (error) {
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_FIELD_MAP_INVALID,
        message:
          error instanceof Error
            ? error.message
            : "The source field map is invalid.",
      });
    }
  }

  private parseEnvelope<TCanonical>(
    envelope: RawEnvelope,
    source: TIngestionSourceContext,
    handler: KindIngestionHandler<TCanonical>,
  ): ParsedEnvelope {
    if (envelope.contractVersion !== handler.contractVersion)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_CONTRACT_VERSION_UNSUPPORTED,
        message: "The ingestion contract version is not supported.",
      });
    if (envelope.kind !== handler.kind || source.kind !== handler.kind)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_KIND_MISMATCH,
        message: `This credential can only submit ${handler.kind.toLowerCase()} content.`,
      });
    if (
      envelope.mode !== IngestionBatchMode.INCREMENTAL &&
      envelope.mode !== IngestionBatchMode.FULL
    )
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_ENVELOPE_INVALID,
        message: "The batch mode must be INCREMENTAL or FULL.",
      });
    if (
      typeof envelope.dryRun !== "undefined" &&
      typeof envelope.dryRun !== "boolean"
    )
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_ENVELOPE_INVALID,
        message: "dryRun must be a boolean when supplied.",
      });
    if (!Array.isArray(envelope.items))
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_ENVELOPE_INVALID,
        message: "items must be an array.",
      });
    if (envelope.items.length > handler.itemLimit)
      throw new PayloadTooLargeException({
        code: IngestionMessageCode.INGESTION_BATCH_TOO_LARGE,
        message: `An ingestion batch may contain at most ${handler.itemLimit} items.`,
      });
    return {
      dryRun: envelope.dryRun ?? false,
      items: envelope.items,
      mode: envelope.mode,
    };
  }

  private validateContentLength(
    contentLength: string | undefined,
    limit: number,
  ) {
    if (!contentLength) return;
    const bytes = Number(contentLength);
    if (!Number.isFinite(bytes) || bytes < 0)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_ENVELOPE_INVALID,
        message: "Content-Length must be a non-negative number.",
      });
    if (bytes > limit)
      throw new PayloadTooLargeException({
        code: IngestionMessageCode.INGESTION_BODY_TOO_LARGE,
        message: `The compressed request body may not exceed ${limit} bytes.`,
      });
  }

  private validateIdempotencyKey(value: string | undefined, limit: number) {
    const idempotencyKey = value?.trim();
    if (!idempotencyKey)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_IDEMPOTENCY_KEY_REQUIRED,
        message: "Idempotency-Key is required.",
      });
    if (idempotencyKey.length > limit)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_ENVELOPE_INVALID,
        message: `Idempotency-Key may not exceed ${limit} characters.`,
      });
    return idempotencyKey;
  }

  private async claimBatch(input: {
    sourceId: string;
    idempotencyKey: string;
    mode: IngestionBatchMode;
    receivedCount: number;
  }) {
    try {
      const batch = await this.prisma.ingestionBatch.create({
        data: {
          sourceId: input.sourceId,
          idempotencyKey: input.idempotencyKey,
          mode: input.mode,
          status: IngestionBatchStatus.PROCESSING,
          receivedCount: input.receivedCount,
          correlationId: requestContext.correlationId(),
        },
      });
      return { isNew: true as const, batch };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      const batch = await this.prisma.ingestionBatch.findUniqueOrThrow({
        where: {
          sourceId_idempotencyKey: {
            sourceId: input.sourceId,
            idempotencyKey: input.idempotencyKey,
          },
        },
      });
      this.logger.warn("Recovered a concurrent ingestion batch submission.", {
        correlationId: requestContext.correlationId(),
        batchId: batch.id,
        sourceId: input.sourceId,
      });
      return { isNew: false as const, batch };
    }
  }

  private async recordProgress(
    tx: Prisma.TransactionClient,
    batchId: string,
    reports: KindIngestionItemReport[],
  ) {
    const receipt = buildKindReceipt({
      batchId,
      dryRun: false,
      mode: IngestionBatchMode.INCREMENTAL,
      status: IngestionBatchStatus.PROCESSING,
      reports,
    });
    await tx.ingestionBatch.update({
      where: { id: batchId },
      data: {
        acceptedCount: receipt.acceptedCount,
        rejectedCount: receipt.rejectedCount,
        report: reports.map(kindReportJson),
      },
    });
  }

  private async persistUnrecoverableRejection(
    batchId: string,
    externalId: string | null,
    unmappedFields: string[],
    priorReports: KindIngestionItemReport[],
  ): Promise<KindIngestionItemReport> {
    const report: KindIngestionItemReport = {
      externalId,
      state: "rejected",
      catalogId: null,
      reason: "The item could not be persisted.",
      unmappedFields,
    };
    await this.prisma.$transaction((tx) =>
      this.recordProgress(tx, batchId, [...priorReports, report]),
    );
    return report;
  }

  private logBatch(
    kind: IngestionContentKind,
    sourceSlug: string,
    receipt: KindIngestionReceipt,
    startedAt: number,
  ) {
    const rejectionReasons = receipt.items.reduce<Record<string, number>>(
      (counts, report) => {
        if (!report.reason) return counts;
        counts[report.reason] = (counts[report.reason] ?? 0) + 1;
        return counts;
      },
      {},
    );
    this.logger.log("Ingestion batch completed.", {
      correlationId: requestContext.correlationId(),
      kind,
      sourceSlug,
      durationMs: Date.now() - startedAt,
      receivedCount: receipt.receivedCount,
      acceptedCount: receipt.acceptedCount,
      rejectedCount: receipt.rejectedCount,
      createdCount: receipt.createdCount,
      updatedCount: receipt.updatedCount,
      unchangedCount: receipt.unchangedCount,
      rejectionReasons,
    });
  }

  /** Shared batch reads for the per-kind `GET` handlers. */
  async getBatchForSource(sourceId: string, batchId: string) {
    const batch = await this.prisma.ingestionBatch.findFirst({
      where: { id: batchId, sourceId },
    });
    if (!batch)
      throw new NotFoundException({
        code: IngestionMessageCode.INGESTION_BATCH_NOT_FOUND,
        message: "Ingestion batch not found.",
      });
    return storedKindReceipt(batch);
  }
}
