import { IngestionContentKind } from "@prisma/client";
import { IngestionItemState, Prisma } from "@prisma/client";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { COURSE_INGESTION_EVENT_VERSION } from "@ingestion/enums/course-ingestion.constant";
import { COURSE_INGESTION_EVENT_NAME } from "@ingestion/enums/course-ingestion.constant";
import { validateCourseFieldMap } from "@ingestion/utils/course-field-map.util";
import { validateCanonicalFieldMap } from "@ingestion/utils/canonical-field-map.util";
import { CanonicalFieldMapError } from "@ingestion/utils/canonical-field-map.util";
import { EVENT_CANONICAL_FIELDS } from "@ingestion/enums/event-ingestion.constant";
import { PODCAST_CANONICAL_FIELDS } from "@ingestion/enums/podcast-ingestion.constant";
import { YOUTUBE_CANONICAL_FIELDS } from "@ingestion/enums/youtube-ingestion.constant";
import { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import { CourseFieldMapError } from "@ingestion/utils/course-field-map.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";

import type { CreateIngestionSourceInput } from "@ingestion/dtos/create-ingestion-source.input";
import type { UpdateIngestionSourceInput } from "@ingestion/dtos/update-ingestion-source.input";
import type { IngestionSourceFilterInput } from "@ingestion/dtos/ingestion-source-filter.input";
import type { IssueIngestionApiKeyInput } from "@ingestion/dtos/issue-ingestion-api-key.input";
import type { IngestionItemFilterInput } from "@ingestion/dtos/ingestion-item-filter.input";

const UNIQUE_VIOLATION = "P2002";
const ITEM_SEARCH_MIN_LENGTH = 2;
const ITEM_SEARCH_ID_LIMIT = 500;

type Pagination = { take: number; cursor?: string };

@Injectable()
export class IngestionAdminService {
  private readonly logger = new Logger(IngestionAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiKeys: IngestionApiKeyService,
    private readonly courseIngestion: CourseIngestionService,
    private readonly outbox: OutboxService,
  ) {}

  async listSources(
    filter: IngestionSourceFilterInput | undefined,
    pagination: Pagination,
  ) {
    const search = filter?.search?.trim();
    const where: Prisma.IngestionSourceWhereInput = {
      ...(filter?.kind ? { kind: filter.kind } : {}),
      ...(filter?.isActive !== undefined ? { isActive: filter.isActive } : {}),
      ...(search
        ? {
            OR: [
              { slug: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const rows = await this.prisma.ingestionSource.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: pagination.take + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
    });
    const hasNextPage = rows.length > pagination.take;
    const items = hasNextPage ? rows.slice(0, pagination.take) : rows;
    const totalCount = await this.prisma.ingestionSource.count({ where });

    return {
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
      },
      items,
    };
  }

  async getSource(sourceId: string) {
    return this.requireSource(sourceId);
  }

  async createSource(actorId: string, input: CreateIngestionSourceInput) {
    const fieldMap = this.validateFieldMap(input.kind, input.fieldMap);

    try {
      const source = await this.prisma.ingestionSource.create({
        data: {
          slug: input.slug,
          name: input.name,
          kind: input.kind,
          autoPublish: input.autoPublish ?? false,
          stalenessWindowDays: input.stalenessWindowDays ?? null,
          fieldMap: fieldMap as Prisma.InputJsonValue,
        },
      });
      this.logger.log("Created an ingestion source.", {
        correlationId: requestContext.correlationId(),
        actorId,
        sourceId: source.id,
        sourceSlug: source.slug,
      });
      return source;
    } catch (error) {
      if (this.isUniqueViolation(error, "slug"))
        throw new BadRequestException({
          code: IngestionMessageCode.INGESTION_SOURCE_SLUG_EXISTS,
          message: "An ingestion source with this slug already exists.",
        });
      throw error;
    }
  }

  async updateSource(actorId: string, input: UpdateIngestionSourceInput) {
    const existing = await this.requireSource(input.sourceId);
    const fieldMap =
      input.fieldMap === undefined
        ? undefined
        : this.validateFieldMap(existing.kind, input.fieldMap);

    const source = await this.prisma.ingestionSource.update({
      where: { id: input.sourceId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.autoPublish !== undefined
          ? { autoPublish: input.autoPublish }
          : {}),
        ...(input.stalenessWindowDays !== undefined
          ? { stalenessWindowDays: input.stalenessWindowDays }
          : {}),
        ...(fieldMap !== undefined
          ? { fieldMap: fieldMap as Prisma.InputJsonValue }
          : {}),
      },
    });
    this.logger.log("Updated an ingestion source.", {
      correlationId: requestContext.correlationId(),
      actorId,
      sourceId: source.id,
    });
    return source;
  }

  async setSourceActive(actorId: string, sourceId: string, isActive: boolean) {
    await this.requireSource(sourceId);
    const source = await this.prisma.ingestionSource.update({
      where: { id: sourceId },
      data: { isActive },
    });
    this.logger.log(
      isActive
        ? "Activated an ingestion source."
        : "Deactivated an ingestion source.",
      {
        correlationId: requestContext.correlationId(),
        actorId,
        sourceId: source.id,
      },
    );
    return source;
  }

  async listKeys(sourceId: string) {
    await this.requireSource(sourceId);
    return this.apiKeys.listForSource(sourceId);
  }

  async issueKey(actorId: string, input: IssueIngestionApiKeyInput) {
    await this.requireSource(input.sourceId);
    const issued = await this.apiKeys.issueKey({
      sourceId: input.sourceId,
      name: input.name,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });
    this.logger.log("Issued an ingestion API key.", {
      correlationId: requestContext.correlationId(),
      actorId,
      sourceId: input.sourceId,
      keyPrefix: issued.prefix,
    });
    const key = await this.prisma.ingestionApiKey.findUniqueOrThrow({
      where: { id: issued.id },
      select: {
        id: true,
        sourceId: true,
        name: true,
        prefix: true,
        createdAt: true,
        expiresAt: true,
        revokedAt: true,
        lastUsedAt: true,
      },
    });
    return { ...key, credential: issued.credentialShownOnce };
  }

  async revokeKey(actorId: string, keyId: string) {
    const revoked = await this.apiKeys.revokeKey(keyId);
    if (!revoked)
      throw new NotFoundException({
        code: IngestionMessageCode.INGESTION_API_KEY_NOT_FOUND,
        message: "Ingestion API key not found.",
      });
    this.logger.log("Revoked an ingestion API key.", {
      correlationId: requestContext.correlationId(),
      actorId,
      keyId: revoked.id,
      keyPrefix: revoked.prefix,
    });
    return revoked;
  }

  async getBatch(batchId: string) {
    return this.courseIngestion.getBatchForAdmin(batchId);
  }

  async listBatches(sourceId: string, pagination: Pagination) {
    await this.requireSource(sourceId);
    return this.courseIngestion.listBatchesForSource(sourceId, pagination);
  }

  async listItems(
    filter: IngestionItemFilterInput | undefined,
    pagination: Pagination,
  ) {
    const search = filter?.search?.trim();
    const catalogIds =
      search && search.length >= ITEM_SEARCH_MIN_LENGTH
        ? await this.matchingCatalogIds(search)
        : null;

    const where: Prisma.IngestionItemWhereInput = {
      ...(filter?.sourceId ? { sourceId: filter.sourceId } : {}),
      ...(filter?.state ? { state: filter.state } : {}),
      ...(catalogIds ? { catalogId: { in: catalogIds } } : {}),
    };

    const rows = await this.prisma.ingestionItem.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: pagination.take + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      include: {
        source: { select: { slug: true, kind: true } },
        reviewedBy: { select: { fullName: true, email: true } },
      },
    });
    const hasNextPage = rows.length > pagination.take;
    const page = hasNextPage ? rows.slice(0, pagination.take) : rows;
    const totalCount = await this.prisma.ingestionItem.count({ where });

    const catalog = await this.catalogSummaries(
      page
        .filter((item) => item.catalogId)
        .map((item) => ({
          catalogId: item.catalogId as string,
          kind: item.source.kind,
        })),
    );

    return {
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null,
      },
      items: page.map((item) => ({
        ...item,
        sourceSlug: item.source.slug,
        reviewedByName:
          item.reviewedBy?.fullName ?? item.reviewedBy?.email ?? null,
        catalog: item.catalogId ? (catalog.get(item.catalogId) ?? null) : null,
      })),
    };
  }

  /**
   * Approval moves the item with a conditional write naming the observed
   * previous state; the item state change and the catalog publish share one
   * transaction. Postgres re-evaluates the WHERE clause after taking the row
   * lock, so two concurrent approvals of the same item serialize: the winner
   * publishes once and appends one outbox event, the loser matches no row,
   * re-reads, finds the item already ACCEPTED, and returns the same result
   * without a second publish or a server error.
   */
  async approveItem(actorId: string, itemId: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.ingestionItem.findUnique({
        where: { id: itemId },
      });
      if (!item)
        throw new NotFoundException({
          code: IngestionMessageCode.INGESTION_ITEM_NOT_FOUND,
          message: "Ingestion item not found.",
        });
      if (item.state === IngestionItemState.ACCEPTED)
        return this.itemDetail(tx, item.id);
      if (!item.catalogId)
        throw new BadRequestException({
          code: IngestionMessageCode.INGESTION_ITEM_HAS_NO_CATALOG_ROW,
          message:
            "This item never produced a catalog row and cannot be approved.",
        });

      const source = await tx.ingestionSource.findUniqueOrThrow({
        where: { id: item.sourceId },
        select: { kind: true },
      });

      const claim = await tx.ingestionItem.updateMany({
        where: { id: itemId, state: item.state },
        data: {
          state: IngestionItemState.ACCEPTED,
          reviewedById: actorId,
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      });
      if (claim.count === 0) {
        const current = await tx.ingestionItem.findUniqueOrThrow({
          where: { id: itemId },
        });
        if (current.state === IngestionItemState.ACCEPTED)
          return this.itemDetail(tx, itemId);
        throw new ConflictException({
          code: IngestionMessageCode.INGESTION_ITEM_REVIEW_CONFLICT,
          message: "This item changed state; refresh and try again.",
        });
      }

      await this.setCatalogStatus(tx, source.kind, item.catalogId, "PUBLISHED");
      await this.outbox.append(
        {
          eventName: COURSE_INGESTION_EVENT_NAME,
          eventVersion: COURSE_INGESTION_EVENT_VERSION,
          aggregateType: "IngestionItem",
          aggregateId: item.id,
          correlationId: requestContext.correlationId(),
          payload: {
            itemId: item.id,
            sourceId: item.sourceId,
            catalogId: item.catalogId,
          },
        },
        tx,
      );

      this.logger.log("Approved an ingestion item.", {
        correlationId: requestContext.correlationId(),
        actorId,
        itemId: item.id,
        catalogId: item.catalogId,
      });

      return this.itemDetail(tx, itemId);
    });
  }

  async rejectItem(actorId: string, itemId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.ingestionItem.findUnique({
        where: { id: itemId },
      });
      if (!item)
        throw new NotFoundException({
          code: IngestionMessageCode.INGESTION_ITEM_NOT_FOUND,
          message: "Ingestion item not found.",
        });

      const claim = await tx.ingestionItem.updateMany({
        where: { id: itemId, state: item.state },
        data: {
          state: IngestionItemState.REJECTED,
          rejectionReason: reason,
          reviewedById: actorId,
          reviewedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        const current = await tx.ingestionItem.findUniqueOrThrow({
          where: { id: itemId },
        });
        if (current.state === IngestionItemState.REJECTED)
          return this.itemDetail(tx, itemId);
        throw new ConflictException({
          code: IngestionMessageCode.INGESTION_ITEM_REVIEW_CONFLICT,
          message: "This item changed state; refresh and try again.",
        });
      }

      if (item.catalogId) {
        const source = await tx.ingestionSource.findUniqueOrThrow({
          where: { id: item.sourceId },
          select: { kind: true },
        });
        await this.setCatalogStatus(tx, source.kind, item.catalogId, "DRAFT");
      }

      this.logger.log("Rejected an ingestion item.", {
        correlationId: requestContext.correlationId(),
        actorId,
        itemId: item.id,
      });

      return this.itemDetail(tx, itemId);
    });
  }

  private async itemDetail(tx: Prisma.TransactionClient, itemId: string) {
    const item = await tx.ingestionItem.findUniqueOrThrow({
      where: { id: itemId },
      include: {
        source: { select: { slug: true, kind: true } },
        reviewedBy: { select: { fullName: true, email: true } },
      },
    });
    const catalog = item.catalogId
      ? await this.catalogSummaries([
          { catalogId: item.catalogId, kind: item.source.kind },
        ])
      : new Map();
    return {
      ...item,
      sourceSlug: item.source.slug,
      reviewedByName:
        item.reviewedBy?.fullName ?? item.reviewedBy?.email ?? null,
      catalog: item.catalogId ? (catalog.get(item.catalogId) ?? null) : null,
    };
  }

  /**
   * The review queue and batch detail cover every kind, so a catalog summary
   * is read from whichever table the item's kind writes to. `status` is
   * flattened onto the shared DRAFT / PUBLISHED / ARCHIVED vocabulary — an
   * event's CANCELLED reads as ARCHIVED — so the GraphQL contract stays a
   * single enum.
   */
  private async catalogSummaries(
    entries: Array<{ catalogId: string; kind: IngestionContentKind }>,
  ) {
    const summaries = new Map<string, unknown>();
    const byKind = new Map<IngestionContentKind, string[]>();
    for (const { catalogId, kind } of entries) {
      const ids = byKind.get(kind) ?? [];
      ids.push(catalogId);
      byKind.set(kind, ids);
    }

    const select = {
      id: true,
      title: true,
      slug: true,
      status: true,
      imageUrl: true,
    } as const;
    const flatten = (row: {
      id: string;
      title: string;
      slug: string;
      status: string;
      imageUrl: string | null;
    }) => ({
      ...row,
      status: row.status === "CANCELLED" ? "ARCHIVED" : row.status,
    });

    for (const [kind, ids] of byKind) {
      const unique = [...new Set(ids)];
      if (unique.length === 0) continue;
      const rows =
        kind === IngestionContentKind.COURSE
          ? await this.prisma.course.findMany({
              where: { id: { in: unique } },
              select,
            })
          : kind === IngestionContentKind.EVENT
            ? await this.prisma.event.findMany({
                where: { id: { in: unique } },
                select,
              })
            : kind === IngestionContentKind.PODCAST
              ? await this.prisma.podcast.findMany({
                  where: { id: { in: unique } },
                  select,
                })
              : await this.prisma.youTubeChannel.findMany({
                  where: { id: { in: unique } },
                  select,
                });
      for (const row of rows) summaries.set(row.id, flatten(row));
    }
    return summaries;
  }

  private async matchingCatalogIds(search: string) {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Course"  WHERE title ILIKE '%' || ${search} || '%' OR title % ${search}
      UNION
      SELECT id FROM "Event"   WHERE title ILIKE '%' || ${search} || '%' OR title % ${search}
      UNION
      SELECT id FROM "Podcast" WHERE title ILIKE '%' || ${search} || '%' OR title % ${search}
      UNION
      SELECT id FROM "YouTubeChannel" WHERE title ILIKE '%' || ${search} || '%' OR title % ${search}
      LIMIT ${ITEM_SEARCH_ID_LIMIT}
    `;
    return rows.map((row) => row.id);
  }

  private async setCatalogStatus(
    tx: Prisma.TransactionClient,
    kind: IngestionContentKind,
    catalogId: string,
    status: "PUBLISHED" | "DRAFT",
  ) {
    if (kind === IngestionContentKind.COURSE)
      await tx.course.update({ where: { id: catalogId }, data: { status } });
    else if (kind === IngestionContentKind.EVENT)
      await tx.event.update({ where: { id: catalogId }, data: { status } });
    else if (kind === IngestionContentKind.PODCAST)
      await tx.podcast.update({ where: { id: catalogId }, data: { status } });
    else
      await tx.youTubeChannel.update({
        where: { id: catalogId },
        data: { status },
      });
  }

  private async requireSource(sourceId: string) {
    const source = await this.prisma.ingestionSource.findUnique({
      where: { id: sourceId },
    });
    if (!source)
      throw new NotFoundException({
        code: IngestionMessageCode.INGESTION_SOURCE_NOT_FOUND,
        message: "Ingestion source not found.",
      });
    return source;
  }

  private validateFieldMap(
    kind: IngestionContentKind | string,
    fieldMap: unknown,
  ) {
    if (fieldMap === undefined || fieldMap === null) return {};
    try {
      if (kind === IngestionContentKind.COURSE)
        return validateCourseFieldMap(fieldMap);
      if (kind === IngestionContentKind.EVENT)
        return validateCanonicalFieldMap(
          fieldMap,
          EVENT_CANONICAL_FIELDS,
          "event",
        );
      if (kind === IngestionContentKind.PODCAST)
        return validateCanonicalFieldMap(
          fieldMap,
          PODCAST_CANONICAL_FIELDS,
          "podcast",
        );
      return validateCanonicalFieldMap(
        fieldMap,
        YOUTUBE_CANONICAL_FIELDS,
        "youtube",
      );
    } catch (error) {
      if (
        error instanceof CourseFieldMapError ||
        error instanceof CanonicalFieldMapError
      )
        throw new BadRequestException({
          code: IngestionMessageCode.INGESTION_FIELD_MAP_INVALID,
          message: error.message,
        });
      throw error;
    }
  }

  private isUniqueViolation(error: unknown, column: string) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== UNIQUE_VIOLATION
    )
      return false;
    const target = error.meta?.target;
    const columns = Array.isArray(target)
      ? target.map(String)
      : [String(target)];
    return columns.includes(column);
  }
}
