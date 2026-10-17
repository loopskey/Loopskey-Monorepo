import { KIND_INGESTION_COMPRESSED_BODY_LIMIT_BYTES } from "@ingestion/enums/kind-ingestion.constant";
import { CATALOG_CONTENT_CHANGED_EVENT_VERSION } from "@ingestion/enums/kind-ingestion.constant";
import { KIND_INGESTION_IDEMPOTENCY_KEY_LIMIT } from "@ingestion/enums/kind-ingestion.constant";
import { KIND_INGESTION_CONTRACT_VERSION } from "@ingestion/enums/kind-ingestion.constant";
import { KIND_INGESTION_PERSIST_ATTEMPTS } from "@ingestion/enums/kind-ingestion.constant";
import { CATALOG_CONTENT_CHANGED_EVENT } from "@ingestion/enums/kind-ingestion.constant";
import { KIND_INGESTION_EVENT_VERSION } from "@ingestion/enums/kind-ingestion.constant";
import { IngestionItemState, Prisma } from "@prisma/client";
import { KIND_INGESTION_EVENT_NAME } from "@ingestion/enums/kind-ingestion.constant";
import { KIND_INGESTION_ITEM_LIMIT } from "@ingestion/enums/kind-ingestion.constant";
import { assessPublicationQuality } from "@ingestion/utils/publication-quality.util";
import { uniqueViolationTargets } from "@ingestion/utils/ingestion-batch.util";
import { IngestionReviewReason } from "@prisma/client";
import { IngestionContentKind } from "@prisma/client";
import { isUniqueViolation } from "@ingestion/utils/ingestion-batch.util";
import { holdsPublication } from "@ingestion/utils/publication-quality.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { createHash } from "node:crypto";
import { slugify } from "@utils/slug.util";
import { Logger } from "@nestjs/common";

import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";
import type { KindIngestionItemReport } from "@ingestion/types/kind-ingestion.types";
import type { KindIngestionHandler } from "@ingestion/types/kind-ingestion.types";
import type { PersistAcceptedArgs } from "@ingestion/types/kind-ingestion.types";
import type { PersistRejectedArgs } from "@ingestion/types/kind-ingestion.types";
import type { AcceptedKindItem } from "@ingestion/types/kind-ingestion.types";
import type { PreparedKindItem } from "@ingestion/types/kind-ingestion.types";

type LockedItem = {
  id: string;
  canonicalHash: string;
  catalogId: string | null;
  state: IngestionItemState;
  reviewedById: string | null;
};

type PublicationText = {
  title?: string | null;
  description?: string | null;
};

export type CatalogWriteResult = {
  catalogId: string;
  changeState: "created" | "updated";
};

export abstract class AbstractKindIngestionService<TCanonical>
  implements KindIngestionHandler<TCanonical>
{
  protected readonly logger = new Logger(this.constructor.name);

  readonly contractVersion = KIND_INGESTION_CONTRACT_VERSION;
  readonly itemLimit = KIND_INGESTION_ITEM_LIMIT;
  readonly bodyLimitBytes = KIND_INGESTION_COMPRESSED_BODY_LIMIT_BYTES;
  readonly idempotencyKeyLimit = KIND_INGESTION_IDEMPOTENCY_KEY_LIMIT;

  abstract readonly kind: IngestionContentKind;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly outbox: OutboxService,
  ) {}

  abstract resolveFieldMap(rawFieldMap: unknown): Record<string, string>;

  abstract prepare(
    rawItem: unknown,
    fieldMap: Record<string, string>,
    includeUnmappedValues: boolean,
  ): PreparedKindItem<TCanonical>;

  protected abstract coreLinks(prepared: AcceptedKindItem<TCanonical>): {
    canonicalUrl: string;
    imageCandidateUrl: string | null;
  };

  protected abstract catalogExists(externalRef: string): Promise<boolean>;

  protected abstract writeCatalog(
    tx: Prisma.TransactionClient,
    source: TIngestionSourceContext,
    prepared: AcceptedKindItem<TCanonical>,
    slugAttempt: number,
  ): Promise<CatalogWriteResult>;

  async preview(
    source: TIngestionSourceContext,
    prepared: PreparedKindItem<TCanonical>,
  ): Promise<KindIngestionItemReport> {
    if (prepared.outcome === "rejected") return this.rejectedReport(prepared);

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
      return this.acceptedReport(prepared, "unchanged", null);

    const catalogExists = await this.catalogExists(
      this.externalRef(source, prepared.externalId),
    );
    return this.acceptedReport(
      prepared,
      existing || catalogExists ? "updated" : "created",
      null,
    );
  }

  async persistAccepted(
    args: PersistAcceptedArgs<TCanonical>,
  ): Promise<KindIngestionItemReport> {
    const { source, prepared } = args;
    for (
      let attempt = 0;
      attempt < KIND_INGESTION_PERSIST_ATTEMPTS;
      attempt += 1
    ) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const existing = await this.lockItem(
            tx,
            source.sourceId,
            prepared.externalId,
          );
          if (
            existing?.canonicalHash === prepared.canonicalHash &&
            existing.catalogId
          ) {
            const report = this.acceptedReport(
              prepared,
              "unchanged",
              existing.catalogId,
            );
            await args.recordProgress(tx, [...args.priorReports, report]);
            return report;
          }

          const links = this.coreLinks(prepared);
          const reviewReasons = this.reviewReasons(prepared, existing, links);
          const publishing = {
            ...source,
            autoPublish: source.autoPublish && !holdsPublication(reviewReasons),
          };
          const { catalogId, changeState } = await this.writeCatalog(
            tx,
            publishing,
            prepared,
            attempt,
          );
          const itemData = {
            batchId: args.batchId,
            canonicalUrl: links.canonicalUrl,
            canonicalHash: prepared.canonicalHash,
            unmappedFields: prepared.unmappedFields,
            imageCandidateUrl: links.imageCandidateUrl,
            state: publishing.autoPublish
              ? IngestionItemState.ACCEPTED
              : IngestionItemState.PENDING,
            rejectionReason: null,
            reviewReasons,
            catalogId,
            lastSeenAt: new Date(),
          };
          const item = existing
            ? await tx.ingestionItem.update({
                where: { id: existing.id },
                data: itemData,
                select: { id: true },
              })
            : await tx.ingestionItem.create({
                data: {
                  ...itemData,
                  sourceId: source.sourceId,
                  externalId: prepared.externalId,
                },
                select: { id: true },
              });

          if (source.autoPublish && !publishing.autoPublish)
            this.logger.warn("Held an ingested item for review.", {
              correlationId: requestContext.correlationId(),
              sourceId: source.sourceId,
              itemId: item.id,
              kind: this.kind,
              reviewReasons,
            });

          await this.outbox.append(
            {
              eventName: KIND_INGESTION_EVENT_NAME,
              eventVersion: KIND_INGESTION_EVENT_VERSION,
              aggregateType: "IngestionItem",
              aggregateId: item.id,
              correlationId: requestContext.correlationId(),
              payload: {
                itemId: item.id,
                sourceId: source.sourceId,
                catalogId,
                kind: this.kind,
              },
            },
            tx,
          );
          await this.outbox.append(
            {
              eventName: CATALOG_CONTENT_CHANGED_EVENT,
              eventVersion: CATALOG_CONTENT_CHANGED_EVENT_VERSION,
              aggregateType: "IngestionItem",
              aggregateId: item.id,
              correlationId: requestContext.correlationId(),
              payload: { catalogId, kind: this.kind },
            },
            tx,
          );

          const report = this.acceptedReport(prepared, changeState, catalogId);
          await args.recordProgress(tx, [...args.priorReports, report]);
          return report;
        });
      } catch (error) {
        const targets = uniqueViolationTargets(error);
        if (!targets) throw error;
        this.logger.warn("Recovered a concurrent ingestion write.", {
          correlationId: requestContext.correlationId(),
          kind: this.kind,
          sourceId: source.sourceId,
          targets,
        });
      }
    }
    throw new Error("Ingestion write did not converge.");
  }

  async persistRejected(
    args: PersistRejectedArgs<TCanonical>,
  ): Promise<KindIngestionItemReport> {
    const { source, prepared } = args;
    const report = this.rejectedReport(prepared);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await this.prisma.$transaction(async (tx) => {
          if (prepared.externalId) {
            const existing = await this.lockItem(
              tx,
              source.sourceId,
              prepared.externalId,
            );
            const itemData = {
              batchId: args.batchId,
              canonicalHash: prepared.canonicalHash,
              unmappedFields: prepared.unmappedFields,
              state: IngestionItemState.REJECTED,
              rejectionReason: prepared.reason,
              lastSeenAt: new Date(),
            };
            if (existing)
              await tx.ingestionItem.update({
                where: { id: existing.id },
                data: itemData,
              });
            else
              await tx.ingestionItem.create({
                data: {
                  ...itemData,
                  sourceId: source.sourceId,
                  externalId: prepared.externalId,
                },
              });
          }
          await args.recordProgress(tx, [...args.priorReports, report]);
        });
        return report;
      } catch (error) {
        if (!isUniqueViolation(error) || attempt > 0) throw error;
      }
    }
    return report;
  }

  protected async lockItem(
    tx: Prisma.TransactionClient,
    sourceId: string,
    externalId: string,
  ): Promise<LockedItem | null> {
    const rows = await tx.$queryRaw<LockedItem[]>`
      SELECT "id", "canonicalHash", "catalogId", "state", "reviewedById"
      FROM "IngestionItem"
      WHERE "sourceId" = ${sourceId} AND "externalId" = ${externalId}
      FOR UPDATE
    `;
    return rows[0] ?? null;
  }

  private reviewReasons(
    prepared: AcceptedKindItem<TCanonical>,
    existing: LockedItem | null,
    links: { canonicalUrl: string },
  ): IngestionReviewReason[] {
    const text = prepared.canonical as PublicationText;
    const rejectedByReviewer =
      existing?.state === IngestionItemState.REJECTED &&
      existing.reviewedById !== null;
    return [
      ...(rejectedByReviewer
        ? [IngestionReviewReason.PREVIOUSLY_REJECTED]
        : []),
      ...assessPublicationQuality({
        title: text.title,
        description: text.description,
        urls: [links.canonicalUrl],
      }),
    ];
  }

  protected externalRef(source: TIngestionSourceContext, externalId: string) {
    return `${source.sourceSlug}:${externalId}`;
  }

  protected slugCandidate(
    source: TIngestionSourceContext,
    externalId: string,
    attempt: number,
  ) {
    const base = slugify(`${source.sourceSlug}-${externalId}`);
    if (!base) throw new Error("The catalog slug could not be generated.");
    if (attempt === 0) return base;
    const hash = createHash("sha256")
      .update(this.externalRef(source, externalId))
      .digest("hex")
      .slice(0, 6);
    return attempt === 1 ? `${base}-${hash}` : `${base}-${hash}-${attempt}`;
  }

  protected publishedStatus(
    source: TIngestionSourceContext,
  ): "PUBLISHED" | "DRAFT" {
    return source.autoPublish ? "PUBLISHED" : "DRAFT";
  }

  private acceptedReport(
    prepared: AcceptedKindItem<TCanonical>,
    state: "created" | "updated" | "unchanged",
    catalogId: string | null,
  ): KindIngestionItemReport {
    return {
      externalId: prepared.externalId,
      state,
      catalogId,
      reason: null,
      unmappedFields: prepared.unmappedFields,
      ...(prepared.unmappedValues
        ? { unmappedValues: prepared.unmappedValues }
        : {}),
    };
  }

  private rejectedReport(
    prepared: Extract<PreparedKindItem<TCanonical>, { outcome: "rejected" }>,
  ): KindIngestionItemReport {
    return {
      externalId: prepared.externalId,
      state: "rejected",
      catalogId: null,
      reason: prepared.reason,
      unmappedFields: prepared.unmappedFields,
      ...(prepared.unmappedValues
        ? { unmappedValues: prepared.unmappedValues }
        : {}),
    };
  }
}
