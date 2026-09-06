import { associationReportDownloadUrl } from "@loopskey/api-contracts/upload";
import { AssociationGeneratedReportState } from "@/lib/graphql/base";
import { AssociationReportFormat, AssociationReportType } from "@/lib/graphql/base";

import { PDU_API_ORIGIN } from "@utils/pdu.constant";

import type { TAssociationReportKey } from "@utils/association-reports";

export const EXPORT_POLL_MS = 4000;

export const EXPORT_FORMATS = [
  AssociationReportFormat.Pdf,
  AssociationReportFormat.Excel,
] as const;

export const REPORT_TYPE_OF: Record<
  TAssociationReportKey,
  AssociationReportType
> = {
  "overview-summary": AssociationReportType.OverviewSummary,
  "member-progress": AssociationReportType.MemberProgress,
  "group-progress": AssociationReportType.GroupProgress,
  "category-completion": AssociationReportType.CategoryCompletion,
  "missing-evidence": AssociationReportType.MissingEvidence,
  "renewal-readiness": AssociationReportType.RenewalReadiness,
};

export const REPORT_KEY_OF: Record<
  AssociationReportType,
  TAssociationReportKey
> = {
  [AssociationReportType.OverviewSummary]: "overview-summary",
  [AssociationReportType.MemberProgress]: "member-progress",
  [AssociationReportType.GroupProgress]: "group-progress",
  [AssociationReportType.CategoryCompletion]: "category-completion",
  [AssociationReportType.MissingEvidence]: "missing-evidence",
  [AssociationReportType.RenewalReadiness]: "renewal-readiness",
};

export const isExportPending = (state: AssociationGeneratedReportState) =>
  state === AssociationGeneratedReportState.Pending;

export const isExportReady = (state: AssociationGeneratedReportState) =>
  state === AssociationGeneratedReportState.Ready;

export const isExportRetryable = (state: AssociationGeneratedReportState) =>
  state === AssociationGeneratedReportState.Failed ||
  state === AssociationGeneratedReportState.Expired;

const SIZE_UNITS = ["B", "KB", "MB"] as const;

export const formatExportSize = (
  bytes: number | null | undefined,
  locale: string,
  fallback: string,
) => {
  if (bytes === null || bytes === undefined) return fallback;

  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < SIZE_UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${size.toLocaleString(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${SIZE_UNITS[unit]}`;
};

export const downloadAssociationReportExport = async (file: {
  id: string;
  fileName: string;
}) => {
  const response = await fetch(
    associationReportDownloadUrl(PDU_API_ORIGIN, file.id),
    { credentials: "include" },
  );

  if (!response.ok) throw new Error(`Download failed (${response.status})`);

  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};
