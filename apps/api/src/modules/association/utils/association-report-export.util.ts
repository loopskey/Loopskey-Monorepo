import { AssociationReportFormat, AssociationReportType } from "@prisma/client";
import { createHash, randomUUID } from "crypto";

import { type ReportFilter } from "@association/services/association-report.service";
import * as P from "@association/utils/association-report-period.util";

export const EXPORT_ROW_LIMIT = 20_000;

export const EXPORT_RETENTION_DAYS = 7;

export const EXPORT_LOCALES = ["en", "fr"] as const;

export type ExportLocale = (typeof EXPORT_LOCALES)[number];

const MIME_TYPES: Record<AssociationReportFormat, string> = {
  [AssociationReportFormat.PDF]: "application/pdf",
  [AssociationReportFormat.EXCEL]:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const EXTENSIONS: Record<AssociationReportFormat, string> = {
  [AssociationReportFormat.PDF]: "pdf",
  [AssociationReportFormat.EXCEL]: "xlsx",
};

const REPORT_SLUGS: Record<AssociationReportType, string> = {
  [AssociationReportType.OVERVIEW_SUMMARY]: "overview-summary",
  [AssociationReportType.MEMBER_PROGRESS]: "member-progress",
  [AssociationReportType.GROUP_PROGRESS]: "group-progress",
  [AssociationReportType.CATEGORY_COMPLETION]: "category-completion",
  [AssociationReportType.MISSING_EVIDENCE]: "missing-evidence",
  [AssociationReportType.RENEWAL_READINESS]: "renewal-readiness",
};

export type NormalizedExportFilter = {
  period: P.AssociationReportPeriod;
  startDate: string | null;
  endDate: string | null;
  groupId: string | null;
  requirementId: string | null;
  includeInactive: boolean;
};

const trimmed = (value: string | null | undefined) => {
  const text = value?.trim();
  return text ? text : null;
};

export const normalizeExportFilter = (
  filter: ReportFilter | null | undefined,
): NormalizedExportFilter => {
  const period = filter?.period ?? P.AssociationReportPeriod.THIS_YEAR;
  const isCustom = period === P.AssociationReportPeriod.CUSTOM;

  return {
    period,
    startDate: isCustom ? trimmed(filter?.startDate) : null,
    endDate: isCustom ? trimmed(filter?.endDate) : null,
    groupId: trimmed(filter?.groupId),
    requirementId: trimmed(filter?.requirementId),
    includeInactive: Boolean(filter?.includeInactive),
  };
};

export const exportFilterHash = (filter: NormalizedExportFilter) =>
  createHash("sha256")
    .update(
      JSON.stringify([
        filter.period,
        filter.startDate,
        filter.endDate,
        filter.groupId,
        filter.requirementId,
        filter.includeInactive,
      ]),
    )
    .digest("hex");

export const exportMimeType = (format: AssociationReportFormat) =>
  MIME_TYPES[format];

export const exportReportSlug = (reportType: AssociationReportType) =>
  REPORT_SLUGS[reportType];

export const exportFileName = (
  reportType: AssociationReportType,
  format: AssociationReportFormat,
  at: Date,
) =>
  `${REPORT_SLUGS[reportType]}-${at.toISOString().slice(0, 10)}.${EXTENSIONS[format]}`;

export const exportStorageKey = (format: AssociationReportFormat) =>
  `${randomUUID()}.${EXTENSIONS[format]}`;

export const exportExpiresAt = (at: Date, days = EXPORT_RETENTION_DAYS) =>
  new Date(at.getTime() + days * 24 * 60 * 60 * 1000);

export const exportLocaleOf = (
  value: string | null | undefined,
): ExportLocale =>
  EXPORT_LOCALES.includes(value as ExportLocale)
    ? (value as ExportLocale)
    : "en";

export const exportIntlLocale = (locale: ExportLocale) =>
  locale === "fr" ? "fr-FR" : "en-GB";

const isPeriod = (value: unknown): value is P.AssociationReportPeriod =>
  typeof value === "string" &&
  Object.values(P.AssociationReportPeriod).includes(
    value as P.AssociationReportPeriod,
  );

const readString = (value: unknown) =>
  typeof value === "string" && value.length > 0 ? value : null;

export const readExportFilter = (value: unknown): NormalizedExportFilter => {
  const source = (
    typeof value === "object" && value !== null ? value : {}
  ) as Record<string, unknown>;

  return normalizeExportFilter({
    period: isPeriod(source.period) ? source.period : null,
    startDate: readString(source.startDate),
    endDate: readString(source.endDate),
    groupId: readString(source.groupId),
    requirementId: readString(source.requirementId),
    includeInactive: source.includeInactive === true,
  });
};
