import { IngestionBatchMode, IngestionBatchStatus } from "@prisma/client";
import { IngestionContentKind, Prisma } from "@prisma/client";

import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

/**
 * The report shape phase 03 defined for a course item, reused verbatim for
 * every kind so the batch receipt contract does not fork per kind.
 */
export type KindIngestionItemState =
  | "created"
  | "updated"
  | "unchanged"
  | "rejected";

export type KindIngestionItemReport = {
  externalId: string | null;
  state: KindIngestionItemState;
  catalogId: string | null;
  reason: string | null;
  unmappedFields: string[];
  unmappedValues?: Record<string, unknown>;
};

export type KindIngestionReceipt = {
  batchId: string | null;
  dryRun: boolean;
  mode: IngestionBatchMode;
  status: IngestionBatchStatus | "DRY_RUN";
  receivedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  items: KindIngestionItemReport[];
};

export type PreparedKindItem<TCanonical = unknown> =
  | {
      outcome: "accepted";
      canonical: TCanonical;
      canonicalHash: string;
      externalId: string;
      unmappedFields: string[];
      unmappedValues?: Record<string, unknown>;
    }
  | {
      outcome: "rejected";
      canonicalHash: string;
      externalId: string | null;
      reason: string;
      unmappedFields: string[];
      unmappedValues?: Record<string, unknown>;
    };

export type AcceptedKindItem<TCanonical> = Extract<
  PreparedKindItem<TCanonical>,
  { outcome: "accepted" }
>;

export type RejectedKindItem<TCanonical> = Extract<
  PreparedKindItem<TCanonical>,
  { outcome: "rejected" }
>;

/**
 * Writes the running per-item report onto the batch row inside the same
 * transaction the catalog write uses, so a batch that fails midway still
 * reflects the items that landed before it.
 */
export type RecordBatchProgress = (
  tx: Prisma.TransactionClient,
  reports: KindIngestionItemReport[],
) => Promise<void>;

export type PersistAcceptedArgs<TCanonical> = {
  source: TIngestionSourceContext;
  batchId: string;
  prepared: AcceptedKindItem<TCanonical>;
  priorReports: KindIngestionItemReport[];
  recordProgress: RecordBatchProgress;
};

export type PersistRejectedArgs<TCanonical> = {
  source: TIngestionSourceContext;
  batchId: string;
  prepared: RejectedKindItem<TCanonical>;
  priorReports: KindIngestionItemReport[];
  recordProgress: RecordBatchProgress;
};

/**
 * One kind's catalog knowledge, plugged into the shared batch runner. The
 * runner owns the envelope, idempotency, batch lifecycle and receipt; the
 * handler owns only what is genuinely kind-specific: the canonical shape, its
 * normaliser, and how an accepted item becomes catalog rows.
 */
export interface KindIngestionHandler<TCanonical = unknown> {
  readonly kind: IngestionContentKind;
  readonly contractVersion: string;
  readonly itemLimit: number;
  readonly bodyLimitBytes: number;
  readonly idempotencyKeyLimit: number;

  resolveFieldMap(rawFieldMap: unknown): Record<string, string>;

  prepare(
    rawItem: unknown,
    fieldMap: Record<string, string>,
    includeUnmappedValues: boolean,
  ): PreparedKindItem<TCanonical>;

  preview(
    source: TIngestionSourceContext,
    prepared: PreparedKindItem<TCanonical>,
  ): Promise<KindIngestionItemReport>;

  persistAccepted(
    args: PersistAcceptedArgs<TCanonical>,
  ): Promise<KindIngestionItemReport>;

  persistRejected(
    args: PersistRejectedArgs<TCanonical>,
  ): Promise<KindIngestionItemReport>;
}
