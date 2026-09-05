import { AssociationReportFormat, AssociationReportType } from "@prisma/client";

import { type ReportFilter } from "@association/services/association-report.service";

export type ExportCell = string | number | Date | null;

export type ExportColumnKind =
  | "text"
  | "integer"
  | "decimal"
  | "percent"
  | "date";

export type ExportColumn = {
  key: string;
  label: string;
  kind: ExportColumnKind;
  weight: number;
};

export type ExportEntry = {
  label: string;
  value: string;
};

export type ExportRow = Record<string, ExportCell>;

export type ReportExportDataset = {
  title: string;
  answer: string;
  columns: ExportColumn[];
  rows: ExportRow[];
  summary: ExportEntry[];
  filterLines: ExportEntry[];
  totalRows: number;
  isTruncated: boolean;
};

export type ReportExportDocument = {
  locale: string;
  generatedAt: Date;
  associationName: string;
  associationLogoUrl: string | null;
  dataset: ReportExportDataset;
};

export type ReportExportRequest = {
  reportType: AssociationReportType;
  format: AssociationReportFormat;
  filter: ReportFilter;
  locale?: string | null;
};

export type ReportExportPayload = {
  exportId: string;
};
