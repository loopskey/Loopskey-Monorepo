import { type ExportColumnKind } from "@association/types/association-report-export.types";
import { type ReportExportDocument } from "@association/types/association-report-export.types";
import { exportTranslator } from "@association/utils/association-report-export-labels.util";
import { exportLocaleOf } from "@association/utils/association-report-export.util";
import { exportFormatter } from "@association/utils/association-report-export-format.util";

import * as ExcelJS from "exceljs";

const NUMBER_FORMATS: Record<ExportColumnKind, string | null> = {
  text: null,
  integer: "0",
  decimal: "0.00",
  percent: "0.00%",
  date: "dd/mm/yyyy",
};

const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F2937" },
};

const MIN_COLUMN_WIDTH = 12;

const COLUMN_WIDTH_PER_WEIGHT = 4;

const columnWidth = (weight: number) =>
  Math.max(MIN_COLUMN_WIDTH, weight * COLUMN_WIDTH_PER_WEIGHT);

export const writeReportWorkbook = async (document: ReportExportDocument) => {
  const locale = exportLocaleOf(document.locale);
  const t = exportTranslator(locale);
  const format = exportFormatter(locale, t("value.none"));
  const { dataset } = document;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = t("document.platform");
  workbook.created = document.generatedAt;

  const sheet = workbook.addWorksheet(t("sheet.report"), {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = dataset.columns.map((column) => ({
    key: column.key,
    header: column.label,
    width: columnWidth(column.weight),
  }));

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = HEADER_FILL;
  header.alignment = { vertical: "middle" };

  for (const row of dataset.rows) {
    const written = sheet.addRow(
      Object.fromEntries(
        dataset.columns.map((column) => {
          const value = row[column.key];
          if (value === null || value === undefined) return [column.key, null];
          if (column.kind === "percent")
            return [column.key, Number(value) / 100];
          return [column.key, value];
        }),
      ),
    );

    dataset.columns.forEach((column, index) => {
      const format = NUMBER_FORMATS[column.kind];
      if (format) written.getCell(index + 1).numFmt = format;
    });
  }

  if (dataset.columns.length > 0)
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: dataset.columns.length },
    };

  const meta = workbook.addWorksheet(t("sheet.filter"));
  meta.columns = [{ width: 34 }, { width: 62 }];

  const entry = (label: string, value: string | Date) => {
    const row = meta.addRow([label, value]);
    row.getCell(1).font = { bold: true };
    if (value instanceof Date) row.getCell(2).numFmt = "dd/mm/yyyy hh:mm";
    return row;
  };

  const heading = (text: string) => {
    const row = meta.addRow([text]);
    row.getCell(1).font = { bold: true, size: 13 };
    return row;
  };

  heading(dataset.title);
  meta.addRow([dataset.answer]);
  meta.addRow([]);

  entry(t("document.association"), document.associationName);
  entry(t("document.generatedAt"), document.generatedAt);
  entry(t("document.rows"), format.number(dataset.totalRows));

  if (dataset.isTruncated)
    meta.addRow([
      t("document.truncated", {
        rows: format.number(dataset.rows.length),
        total: format.number(dataset.totalRows),
      }),
    ]);

  meta.addRow([]);
  heading(t("document.filter"));

  for (const line of dataset.filterLines) entry(line.label, line.value);

  meta.addRow([]);
  heading(t("document.summary"));

  for (const line of dataset.summary) entry(line.label, line.value);

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
};
