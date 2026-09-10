import { COURSE_INGESTION_COMPRESSED_BODY_LIMIT_BYTES } from "@ingestion/enums/course-ingestion.constant";
import { NotFoundException, PayloadTooLargeException } from "@nestjs/common";
import { IngestionBatchMode, IngestionBatchStatus } from "@prisma/client";
import { IngestionContentKind, IngestionItemState } from "@prisma/client";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { COURSE_INGESTION_IDEMPOTENCY_KEY_LIMIT } from "@ingestion/enums/course-ingestion.constant";
import { COURSE_INGESTION_CONTRACT_VERSION } from "@ingestion/enums/course-ingestion.constant";
import { COURSE_INGESTION_EVENT_VERSION } from "@ingestion/enums/course-ingestion.constant";
import { COURSE_INGESTION_ITEM_LIMIT } from "@ingestion/enums/course-ingestion.constant";
import { COURSE_INGESTION_EVENT_NAME } from "@ingestion/enums/course-ingestion.constant";
import { CourseIngestionPipeline } from "@ingestion/services/course-ingestion-pipeline.service";
import { validateCourseFieldMap } from "@ingestion/utils/course-field-map.util";
import { CourseStatus, Prisma } from "@prisma/client";
import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import { CourseFieldMapError } from "@ingestion/utils/course-field-map.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { createHash } from "node:crypto";
import { slugify } from "@utils/slug.util";

import type { CourseIngestionItemReport } from "@ingestion/types/course-ingestion.types";
import type { CourseBatchEnvelopeInput } from "@ingestion/dtos/course-batch-envelope.input";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";
import type { CourseIngestionReceipt } from "@ingestion/types/course-ingestion.types";
import type { PreparedCourseItem } from "@ingestion/types/course-ingestion.types";

const UNIQUE_VIOLATION = "P2002";
const PERSIST_ATTEMPTS = 7;

type ParsedEnvelope = {
  dryRun: boolean;
  items: unknown[];
  mode: IngestionBatchMode;
};

type LockedIngestionItem = {
  id: string;
  canonicalHash: string;
  catalogId: string | null;
};

@Injectable()
export class CourseIngestionService {
  private readonly logger = new Logger(CourseIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pipeline: CourseIngestionPipeline,
    private readonly outbox: OutboxService,
  ) {}

  async submit(input: {
    source: TIngestionSourceContext;
    envelope: CourseBatchEnvelopeInput;
    idempotencyKey?: string;
    contentLength?: string;
  }): Promise<CourseIngestionReceipt> {
    const startedAt = Date.now();
    this.validateContentLength(input.contentLength);
    const idempotencyKey = this.validateIdempotencyKey(input.idempotencyKey);
    const envelope = this.parseEnvelope(input.envelope, input.source);
    let fieldMap;
    try {
      fieldMap = validateCourseFieldMap(input.source.fieldMap);
    } catch (error) {
      if (!(error instanceof CourseFieldMapError)) throw error;
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_FIELD_MAP_INVALID,
        message: error.message,
      });
    }

    if (envelope.dryRun) {
      const reports = await Promise.all(
        envelope.items.map(async (rawItem) => {
          const prepared = this.pipeline.prepare(rawItem, fieldMap, true);
          return this.preview(input.source, prepared);
        }),
      );
      const receipt = this.buildReceipt({
        batchId: null,
        dryRun: true,
        mode: envelope.mode,
        status: "DRY_RUN",
        reports,
      });
      this.logBatch(input.source.sourceSlug, receipt, startedAt);
      return receipt;
    }

    const claimed = await this.claimBatch({
      sourceId: input.source.sourceId,
      idempotencyKey,
      mode: envelope.mode,
      receivedCount: envelope.items.length,
    });
    if (!claimed.isNew) return this.toStoredReceipt(claimed.batch);

    const reports: CourseIngestionItemReport[] = [];
    try {
      for (const rawItem of envelope.items) {
        const prepared = this.pipeline.prepare(rawItem, fieldMap, false);
        let report: CourseIngestionItemReport;
        try {
          report =
            prepared.outcome === "accepted"
              ? await this.persistAccepted({
                  source: input.source,
                  batchId: claimed.batch.id,
                  prepared,
                  priorReports: reports,
                })
              : await this.persistRejected({
                  sourceId: input.source.sourceId,
                  batchId: claimed.batch.id,
                  prepared,
                  priorReports: reports,
                });
        } catch {
          report = await this.persistUnrecoverableRejection({
            batchId: claimed.batch.id,
            prepared,
            priorReports: reports,
          });
        }
        reports.push(report);
      }

      await this.prisma.ingestionBatch.update({
        where: { id: claimed.batch.id },
        data: { status: IngestionBatchStatus.COMPLETED },
      });
      const receipt = this.buildReceipt({
        batchId: claimed.batch.id,
        dryRun: false,
        mode: envelope.mode,
        status: IngestionBatchStatus.COMPLETED,
        reports,
      });
      this.logBatch(input.source.sourceSlug, receipt, startedAt);
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

  async getBatch(sourceId: string, batchId: string) {
    const batch = await this.prisma.ingestionBatch.findFirst({
      where: { id: batchId, sourceId },
    });
    if (!batch)
      throw new NotFoundException({
        code: IngestionMessageCode.INGESTION_BATCH_NOT_FOUND,
        message: "Ingestion batch not found.",
      });
    return this.toStoredReceipt(batch);
  }

  /**
   * The administrator counterpart of `getBatch`, not scoped to a caller's own
   * source: an admin is platform-wide and reads any batch by id.
   */
  async getBatchForAdmin(batchId: string) {
    const batch = await this.prisma.ingestionBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch)
      throw new NotFoundException({
        code: IngestionMessageCode.INGESTION_BATCH_NOT_FOUND,
        message: "Ingestion batch not found.",
      });
    const receipt = this.toStoredReceipt(batch);
    return {
      ...receipt,
      id: batch.id,
      sourceId: batch.sourceId,
      idempotencyKey: batch.idempotencyKey,
      correlationId: batch.correlationId,
      createdAt: batch.createdAt,
    };
  }

  async listBatchesForSource(
    sourceId: string,
    pagination: { take: number; cursor?: string },
  ) {
    const rows = await this.prisma.ingestionBatch.findMany({
      where: { sourceId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: pagination.take + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
    });
    const hasNextPage = rows.length > pagination.take;
    const page = hasNextPage ? rows.slice(0, pagination.take) : rows;
    const totalCount = await this.prisma.ingestionBatch.count({
      where: { sourceId },
    });
    return {
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null,
      },
      items: page.map((batch) => ({
        ...this.toStoredReceipt(batch),
        id: batch.id,
        sourceId: batch.sourceId,
        idempotencyKey: batch.idempotencyKey,
        correlationId: batch.correlationId,
        createdAt: batch.createdAt,
      })),
    };
  }

  private parseEnvelope(
    envelope: CourseBatchEnvelopeInput,
    source: TIngestionSourceContext,
  ): ParsedEnvelope {
    if (envelope.contractVersion !== COURSE_INGESTION_CONTRACT_VERSION)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_CONTRACT_VERSION_UNSUPPORTED,
        message: "The course ingestion contract version is not supported.",
      });
    if (
      envelope.kind !== IngestionContentKind.COURSE ||
      source.kind !== IngestionContentKind.COURSE
    )
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_KIND_MISMATCH,
        message: "This credential can only submit course content.",
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
    if (envelope.items.length > COURSE_INGESTION_ITEM_LIMIT)
      throw new PayloadTooLargeException({
        code: IngestionMessageCode.INGESTION_BATCH_TOO_LARGE,
        message: `A course ingestion batch may contain at most ${COURSE_INGESTION_ITEM_LIMIT} items.`,
      });
    return {
      dryRun: envelope.dryRun ?? false,
      items: envelope.items,
      mode: envelope.mode,
    };
  }

  private validateContentLength(contentLength?: string) {
    if (!contentLength) return;
    const bytes = Number(contentLength);
    if (!Number.isFinite(bytes) || bytes < 0)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_ENVELOPE_INVALID,
        message: "Content-Length must be a non-negative number.",
      });
    if (bytes > COURSE_INGESTION_COMPRESSED_BODY_LIMIT_BYTES)
      throw new PayloadTooLargeException({
        code: IngestionMessageCode.INGESTION_BODY_TOO_LARGE,
        message: `The compressed request body may not exceed ${COURSE_INGESTION_COMPRESSED_BODY_LIMIT_BYTES} bytes.`,
      });
  }

  private validateIdempotencyKey(value?: string) {
    const idempotencyKey = value?.trim();
    if (!idempotencyKey)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_IDEMPOTENCY_KEY_REQUIRED,
        message: "Idempotency-Key is required.",
      });
    if (idempotencyKey.length > COURSE_INGESTION_IDEMPOTENCY_KEY_LIMIT)
      throw new BadRequestException({
        code: IngestionMessageCode.INGESTION_ENVELOPE_INVALID,
        message: `Idempotency-Key may not exceed ${COURSE_INGESTION_IDEMPOTENCY_KEY_LIMIT} characters.`,
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
      if (!this.isUniqueViolation(error)) throw error;
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

  private async preview(
    source: TIngestionSourceContext,
    prepared: PreparedCourseItem,
  ): Promise<CourseIngestionItemReport> {
    if (prepared.outcome === "rejected")
      return this.reportFromRejected(prepared, true);

    const existing = await this.prisma.ingestionItem.findUnique({
      where: {
        sourceId_externalId: {
          sourceId: source.sourceId,
          externalId: prepared.externalId,
        },
      },
      select: { canonicalHash: true, catalogId: true },
    });
    if (
      existing?.canonicalHash === prepared.canonicalHash &&
      existing.catalogId
    )
      return this.acceptedReport(prepared, "unchanged", null, true);

    const catalogExists = await this.prisma.course.findUnique({
      where: { externalRef: this.externalRef(source, prepared.externalId) },
      select: { id: true },
    });
    return this.acceptedReport(
      prepared,
      existing || catalogExists ? "updated" : "created",
      null,
      true,
    );
  }

  private async persistAccepted(input: {
    source: TIngestionSourceContext;
    batchId: string;
    prepared: Extract<PreparedCourseItem, { outcome: "accepted" }>;
    priorReports: CourseIngestionItemReport[];
  }): Promise<CourseIngestionItemReport> {
    let slugAttempt = 0;
    for (let attempt = 0; attempt < PERSIST_ATTEMPTS; attempt += 1) {
      try {
        return await this.prisma.$transaction(async (transaction) => {
          const existing = await this.lockItem(
            transaction,
            input.source.sourceId,
            input.prepared.externalId,
          );
          if (
            existing?.canonicalHash === input.prepared.canonicalHash &&
            existing.catalogId
          ) {
            const report = this.acceptedReport(
              input.prepared,
              "unchanged",
              existing.catalogId,
              false,
            );
            await this.updateBatchProgress(transaction, input.batchId, [
              ...input.priorReports,
              report,
            ]);
            return report;
          }

          const externalRef = this.externalRef(
            input.source,
            input.prepared.externalId,
          );
          const existingCourse = await transaction.course.findUnique({
            where: { externalRef },
            select: { id: true },
          });
          const courseData = this.courseData(input.source, input.prepared);
          const course = existingCourse
            ? await transaction.course.update({
                where: { id: existingCourse.id },
                data: courseData,
                select: { id: true },
              })
            : await transaction.course.create({
                data: {
                  ...courseData,
                  externalRef,
                  slug: this.slugCandidate(
                    input.source,
                    input.prepared.externalId,
                    slugAttempt,
                  ),
                  providerId: null,
                  userId: null,
                  isFeatured: false,
                },
                select: { id: true },
              });

          const itemData = {
            batchId: input.batchId,
            canonicalUrl: input.prepared.canonical.canonicalUrl,
            canonicalHash: input.prepared.canonicalHash,
            unmappedFields: input.prepared.unmappedFields,
            imageCandidateUrl:
              input.prepared.canonical.imageCandidateUrl ?? null,
            state: input.source.autoPublish
              ? IngestionItemState.ACCEPTED
              : IngestionItemState.PENDING,
            rejectionReason: null,
            catalogId: course.id,
            lastSeenAt: new Date(),
          };
          const ingestionItem = existing
            ? await transaction.ingestionItem.update({
                where: { id: existing.id },
                data: itemData,
                select: { id: true },
              })
            : await transaction.ingestionItem.create({
                data: {
                  ...itemData,
                  sourceId: input.source.sourceId,
                  externalId: input.prepared.externalId,
                },
                select: { id: true },
              });

          await this.outbox.append(
            {
              eventName: COURSE_INGESTION_EVENT_NAME,
              eventVersion: COURSE_INGESTION_EVENT_VERSION,
              aggregateType: "IngestionItem",
              aggregateId: ingestionItem.id,
              correlationId: requestContext.correlationId(),
              payload: {
                itemId: ingestionItem.id,
                sourceId: input.source.sourceId,
                catalogId: course.id,
              },
            },
            transaction,
          );
          const report = this.acceptedReport(
            input.prepared,
            existingCourse ? "updated" : "created",
            course.id,
            false,
          );
          await this.updateBatchProgress(transaction, input.batchId, [
            ...input.priorReports,
            report,
          ]);
          return report;
        });
      } catch (error) {
        const targets = this.uniqueViolationTargets(error);
        if (!targets) throw error;
        if (targets.includes("slug")) slugAttempt += 1;
        this.logger.warn("Recovered a concurrent course ingestion write.", {
          correlationId: requestContext.correlationId(),
          sourceId: input.source.sourceId,
        });
      }
    }
    throw new Error("Course ingestion write did not converge.");
  }

  private async persistRejected(input: {
    sourceId: string;
    batchId: string;
    prepared: Extract<PreparedCourseItem, { outcome: "rejected" }>;
    priorReports: CourseIngestionItemReport[];
  }) {
    const report = this.reportFromRejected(input.prepared, false);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await this.prisma.$transaction(async (transaction) => {
          if (input.prepared.externalId) {
            const existing = await this.lockItem(
              transaction,
              input.sourceId,
              input.prepared.externalId,
            );
            const itemData = {
              batchId: input.batchId,
              canonicalHash: input.prepared.canonicalHash,
              unmappedFields: input.prepared.unmappedFields,
              state: IngestionItemState.REJECTED,
              rejectionReason: input.prepared.reason,
              lastSeenAt: new Date(),
            };
            if (existing)
              await transaction.ingestionItem.update({
                where: { id: existing.id },
                data: itemData,
              });
            else
              await transaction.ingestionItem.create({
                data: {
                  ...itemData,
                  sourceId: input.sourceId,
                  externalId: input.prepared.externalId,
                },
              });
          }
          await this.updateBatchProgress(transaction, input.batchId, [
            ...input.priorReports,
            report,
          ]);
        });
        return report;
      } catch (error) {
        if (!this.isUniqueViolation(error) || attempt > 0) throw error;
      }
    }
    return report;
  }

  private async persistUnrecoverableRejection(input: {
    batchId: string;
    prepared: PreparedCourseItem;
    priorReports: CourseIngestionItemReport[];
  }) {
    const report: CourseIngestionItemReport = {
      externalId: input.prepared.externalId,
      state: "rejected",
      catalogId: null,
      reason: "The item could not be persisted.",
      unmappedFields: input.prepared.unmappedFields,
    };
    await this.prisma.$transaction((transaction) =>
      this.updateBatchProgress(transaction, input.batchId, [
        ...input.priorReports,
        report,
      ]),
    );
    return report;
  }

  private async lockItem(
    transaction: Prisma.TransactionClient,
    sourceId: string,
    externalId: string,
  ) {
    const rows = await transaction.$queryRaw<LockedIngestionItem[]>`
      SELECT "id", "canonicalHash", "catalogId"
      FROM "IngestionItem"
      WHERE "sourceId" = ${sourceId} AND "externalId" = ${externalId}
      FOR UPDATE
    `;
    return rows[0] ?? null;
  }

  private courseData(
    source: TIngestionSourceContext,
    prepared: Extract<PreparedCourseItem, { outcome: "accepted" }>,
  ) {
    const canonical = prepared.canonical;
    const lastUpdatedAt =
      canonical.lastUpdatedAt ?? canonical.updatedAt ?? canonical.crawledAt;
    return {
      title: canonical.title,
      instructor: canonical.instructor,
      description: canonical.description,
      category: canonical.category,
      level: canonical.level,
      status: source.autoPublish ? CourseStatus.PUBLISHED : CourseStatus.DRAFT,
      price:
        canonical.isFree ||
        canonical.price === null ||
        canonical.price === undefined
          ? null
          : new Prisma.Decimal(canonical.price),
      currency: canonical.currency,
      isFree: canonical.isFree,
      durationMinutes: canonical.durationMinutes ?? null,
      ...(lastUpdatedAt ? { lastUpdatedAt: new Date(lastUpdatedAt) } : {}),
      requirements: canonical.requirements,
      learnings: canonical.learnings,
      deletedAt: null,
    };
  }

  private externalRef(source: TIngestionSourceContext, externalId: string) {
    return `${source.sourceSlug}:${externalId}`;
  }

  private slugCandidate(
    source: TIngestionSourceContext,
    externalId: string,
    attempt: number,
  ) {
    const base = slugify(`${source.sourceSlug}-${externalId}`);
    if (!base) throw new Error("The course slug could not be generated.");
    if (attempt === 0) return base;
    const hash = createHash("sha256")
      .update(this.externalRef(source, externalId))
      .digest("hex")
      .slice(0, 6);
    return attempt === 1 ? `${base}-${hash}` : `${base}-${hash}-${attempt}`;
  }

  private async updateBatchProgress(
    transaction: Prisma.TransactionClient,
    batchId: string,
    reports: CourseIngestionItemReport[],
  ) {
    const receipt = this.buildReceipt({
      batchId,
      dryRun: false,
      mode: IngestionBatchMode.INCREMENTAL,
      status: IngestionBatchStatus.PROCESSING,
      reports,
    });
    await transaction.ingestionBatch.update({
      where: { id: batchId },
      data: {
        acceptedCount: receipt.acceptedCount,
        rejectedCount: receipt.rejectedCount,
        report: reports.map((report) => this.reportJson(report)),
      },
    });
  }

  private buildReceipt(input: {
    batchId: string | null;
    dryRun: boolean;
    mode: IngestionBatchMode;
    status: IngestionBatchStatus | "DRY_RUN";
    reports: CourseIngestionItemReport[];
  }): CourseIngestionReceipt {
    const accepted = input.reports.filter(
      (report) => report.state !== "rejected",
    );
    return {
      batchId: input.batchId,
      dryRun: input.dryRun,
      mode: input.mode,
      status: input.status,
      receivedCount: input.reports.length,
      acceptedCount: accepted.length,
      rejectedCount: input.reports.length - accepted.length,
      createdCount: input.reports.filter((report) => report.state === "created")
        .length,
      updatedCount: input.reports.filter((report) => report.state === "updated")
        .length,
      unchangedCount: input.reports.filter(
        (report) => report.state === "unchanged",
      ).length,
      items: input.reports,
    };
  }

  private toStoredReceipt(batch: {
    id: string;
    mode: IngestionBatchMode;
    status: IngestionBatchStatus;
    report: Prisma.JsonValue;
  }) {
    return this.buildReceipt({
      batchId: batch.id,
      dryRun: false,
      mode: batch.mode,
      status: batch.status,
      reports: this.parseStoredReports(batch.report),
    });
  }

  private acceptedReport(
    prepared: Extract<PreparedCourseItem, { outcome: "accepted" }>,
    state: "created" | "updated" | "unchanged",
    catalogId: string | null,
    isDryRun: boolean,
  ): CourseIngestionItemReport {
    return {
      externalId: prepared.externalId,
      state,
      catalogId,
      reason: null,
      unmappedFields: prepared.unmappedFields,
      ...(isDryRun && prepared.unmappedValues
        ? { unmappedValues: prepared.unmappedValues }
        : {}),
    };
  }

  private reportFromRejected(
    prepared: Extract<PreparedCourseItem, { outcome: "rejected" }>,
    isDryRun: boolean,
  ): CourseIngestionItemReport {
    return {
      externalId: prepared.externalId,
      state: "rejected",
      catalogId: null,
      reason: prepared.reason,
      unmappedFields: prepared.unmappedFields,
      ...(isDryRun && prepared.unmappedValues
        ? { unmappedValues: prepared.unmappedValues }
        : {}),
    };
  }

  private reportJson(report: CourseIngestionItemReport): Prisma.JsonObject {
    return {
      externalId: report.externalId,
      state: report.state,
      catalogId: report.catalogId,
      reason: report.reason,
      unmappedFields: report.unmappedFields,
    };
  }

  private parseStoredReports(value: Prisma.JsonValue) {
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry): CourseIngestionItemReport[] => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        return [];
      const externalId = entry.externalId;
      const state = entry.state;
      const catalogId = entry.catalogId;
      const reason = entry.reason;
      const unmappedFields = entry.unmappedFields;
      if (externalId !== null && typeof externalId !== "string") return [];
      if (
        state !== "created" &&
        state !== "updated" &&
        state !== "unchanged" &&
        state !== "rejected"
      )
        return [];
      if (catalogId !== null && typeof catalogId !== "string") return [];
      if (reason !== null && typeof reason !== "string") return [];
      if (
        !Array.isArray(unmappedFields) ||
        !unmappedFields.every(
          (field): field is string => typeof field === "string",
        )
      )
        return [];
      return [
        {
          externalId,
          state,
          catalogId,
          reason,
          unmappedFields,
        },
      ];
    });
  }

  private uniqueViolationTargets(error: unknown): string[] | null {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== UNIQUE_VIOLATION
    )
      return null;
    const target = error.meta?.target;
    if (Array.isArray(target)) return target.map(String);
    if (typeof target === "string") return [target];
    return [];
  }

  private isUniqueViolation(error: unknown) {
    return this.uniqueViolationTargets(error) !== null;
  }

  private logBatch(
    sourceSlug: string,
    receipt: CourseIngestionReceipt,
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
    this.logger.log("Course ingestion batch completed.", {
      correlationId: requestContext.correlationId(),
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
}
