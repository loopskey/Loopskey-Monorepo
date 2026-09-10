import {
  IngestionBatchMode,
  IngestionBatchStatus,
  Prisma,
} from "@prisma/client";

import type { KindIngestionItemReport } from "@ingestion/types/kind-ingestion.types";
import type { KindIngestionReceipt } from "@ingestion/types/kind-ingestion.types";

const UNIQUE_VIOLATION = "P2002";

export const buildKindReceipt = (input: {
  batchId: string | null;
  dryRun: boolean;
  mode: IngestionBatchMode;
  status: IngestionBatchStatus | "DRY_RUN";
  reports: KindIngestionItemReport[];
}): KindIngestionReceipt => {
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
};

export const kindReportJson = (
  report: KindIngestionItemReport,
): Prisma.JsonObject => ({
  externalId: report.externalId,
  state: report.state,
  catalogId: report.catalogId,
  reason: report.reason,
  unmappedFields: report.unmappedFields,
});

export const parseStoredKindReports = (
  value: Prisma.JsonValue,
): KindIngestionItemReport[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): KindIngestionItemReport[] => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const { externalId, state, catalogId, reason, unmappedFields } = entry;
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
    return [{ externalId, state, catalogId, reason, unmappedFields }];
  });
};

export const storedKindReceipt = (batch: {
  id: string;
  mode: IngestionBatchMode;
  status: IngestionBatchStatus;
  report: Prisma.JsonValue;
}): KindIngestionReceipt =>
  buildKindReceipt({
    batchId: batch.id,
    dryRun: false,
    mode: batch.mode,
    status: batch.status,
    reports: parseStoredKindReports(batch.report),
  });

export const uniqueViolationTargets = (error: unknown): string[] | null => {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== UNIQUE_VIOLATION
  )
    return null;
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
};

export const isUniqueViolation = (error: unknown): boolean =>
  uniqueViolationTargets(error) !== null;
