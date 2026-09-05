import { type ExportColumn } from "@association/types/association-report-export.types";
import { type ReportExportDocument } from "@association/types/association-report-export.types";
import { type ExportTranslator } from "@association/utils/association-report-export-labels.util";
import { exportTranslator } from "@association/utils/association-report-export-labels.util";
import { type ExportFormatter } from "@association/utils/association-report-export-format.util";
import { exportFormatter } from "@association/utils/association-report-export-format.util";
import { exportLocaleOf } from "@association/utils/association-report-export.util";

import PDFDocument from "pdfkit";

const PAGE_MARGIN = 36;

const LETTERHEAD_HEIGHT = 52;

const FOOTER_OFFSET = 24;

const ROW_HEIGHT = 16;

const HEADER_ROW_HEIGHT = 20;

const CELL_PADDING = 4;

const INK = "#111827";

const MUTED = "#6B7280";

const RULE = "#D1D5DB";

const HEADER_FILL = "#1F2937";

const STRIPE_FILL = "#F3F4F6";

type Doc = PDFKit.PDFDocument;

type Layout = { x: number; width: number; column: ExportColumn }[];

const layoutOf = (columns: ExportColumn[], width: number): Layout => {
  const total = columns.reduce((sum, column) => sum + column.weight, 0) || 1;
  let x = PAGE_MARGIN;

  return columns.map((column) => {
    const columnWidth = (column.weight / total) * width;
    const placed = { x, width: columnWidth, column };
    x += columnWidth;
    return placed;
  });
};

const isNumeric = (column: ExportColumn) =>
  column.kind === "integer" ||
  column.kind === "decimal" ||
  column.kind === "percent";

export const writeReportPdf = (document: ReportExportDocument) =>
  new Promise<Buffer>((resolve, reject) => {
    const locale = exportLocaleOf(document.locale);
    const t = exportTranslator(locale);
    const format = exportFormatter(locale, t("value.none"));

    const doc = new PDFDocument({
      size: "A4",
      margin: PAGE_MARGIN,
      layout: "landscape",
      bufferPages: true,
      autoFirstPage: false,
      info: {
        Title: document.dataset.title,
        Author: t("document.platform"),
        CreationDate: document.generatedAt,
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      render(doc, document, t, format);
      doc.end();
    } catch (error) {
      reject(error instanceof Error ? error : new Error("PDF render failed."));
    }
  });

const render = (
  doc: Doc,
  document: ReportExportDocument,
  t: ExportTranslator,
  format: ExportFormatter,
) => {
  const { dataset } = document;

  doc.on("pageAdded", () => letterhead(doc, document, t));

  doc.addPage();

  const width = doc.page.width - PAGE_MARGIN * 2;

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(INK)
    .text(dataset.title, PAGE_MARGIN, doc.y, { width });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(MUTED)
    .text(dataset.answer, { width })
    .moveDown(1);

  entries(doc, t("document.filter"), dataset.filterLines, width);
  entries(doc, t("document.summary"), dataset.summary, width);

  if (dataset.isTruncated) {
    doc
      .font("Helvetica-Oblique")
      .fontSize(9)
      .fillColor(MUTED)
      .text(
        t("document.truncated", {
          rows: format.number(dataset.rows.length),
          total: format.number(dataset.totalRows),
        }),
        PAGE_MARGIN,
        doc.y,
        { width },
      );
    doc.moveDown(0.5);
  }

  table(doc, document, t, format, width);

  footers(doc, document, t, format, width);
};

const letterhead = (
  doc: Doc,
  document: ReportExportDocument,
  t: ExportTranslator,
) => {
  const width = doc.page.width - PAGE_MARGIN * 2;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(INK)
    .text(t("document.platform"), PAGE_MARGIN, PAGE_MARGIN, {
      width,
      lineBreak: false,
    });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(MUTED)
    .text(document.associationName, PAGE_MARGIN, PAGE_MARGIN, {
      width,
      align: "right",
      lineBreak: false,
    });

  doc
    .moveTo(PAGE_MARGIN, PAGE_MARGIN + 20)
    .lineTo(PAGE_MARGIN + width, PAGE_MARGIN + 20)
    .strokeColor(RULE)
    .lineWidth(0.5)
    .stroke();

  doc.x = PAGE_MARGIN;
  doc.y = PAGE_MARGIN + LETTERHEAD_HEIGHT - 20;
};

const entries = (
  doc: Doc,
  heading: string,
  lines: { label: string; value: string }[],
  width: number,
) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(INK)
    .text(heading, PAGE_MARGIN, doc.y, { width });

  doc.moveDown(0.2);

  const columnWidth = width / 2;

  for (let index = 0; index < lines.length; index += 2) {
    const top = doc.y;
    const pair = lines.slice(index, index + 2);

    pair.forEach((line, offset) => {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(MUTED)
        .text(`${line.label}: `, PAGE_MARGIN + offset * columnWidth, top, {
          width: columnWidth - CELL_PADDING,
          continued: true,
          lineBreak: false,
        })
        .fillColor(INK)
        .text(line.value, { lineBreak: false });
    });

    doc.y = top + 13;
  }

  doc.moveDown(0.6);
};

const table = (
  doc: Doc,
  document: ReportExportDocument,
  t: ExportTranslator,
  format: ExportFormatter,
  width: number,
) => {
  const { dataset } = document;
  const layout = layoutOf(dataset.columns, width);
  const bottom = doc.page.height - PAGE_MARGIN - FOOTER_OFFSET;

  if (dataset.rows.length === 0) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(MUTED)
      .text(t("document.empty"), PAGE_MARGIN, doc.y, { width });
    return;
  }

  let y = headerRow(doc, layout, doc.y);

  dataset.rows.forEach((row, index) => {
    if (y + ROW_HEIGHT > bottom) {
      doc.addPage();
      y = headerRow(doc, layout, doc.y);
    }

    if (index % 2 === 1)
      doc.rect(PAGE_MARGIN, y, width, ROW_HEIGHT).fill(STRIPE_FILL);

    doc.font("Helvetica").fontSize(8).fillColor(INK);

    for (const placed of layout)
      doc.text(
        format.cell(row[placed.column.key] ?? null, placed.column.kind),
        placed.x + CELL_PADDING,
        y + CELL_PADDING,
        {
          width: placed.width - CELL_PADDING * 2,
          align: isNumeric(placed.column) ? "right" : "left",
          lineBreak: false,
          ellipsis: true,
        },
      );

    y += ROW_HEIGHT;
  });
};

const headerRow = (doc: Doc, layout: Layout, top: number) => {
  const width = doc.page.width - PAGE_MARGIN * 2;

  doc.rect(PAGE_MARGIN, top, width, HEADER_ROW_HEIGHT).fill(HEADER_FILL);

  doc.font("Helvetica-Bold").fontSize(8).fillColor("#FFFFFF");

  for (const placed of layout)
    doc.text(placed.column.label, placed.x + CELL_PADDING, top + 6, {
      width: placed.width - CELL_PADDING * 2,
      align: isNumeric(placed.column) ? "right" : "left",
      lineBreak: false,
      ellipsis: true,
    });

  return top + HEADER_ROW_HEIGHT;
};

const footers = (
  doc: Doc,
  document: ReportExportDocument,
  t: ExportTranslator,
  format: ExportFormatter,
  width: number,
) => {
  const range = doc.bufferedPageRange();
  const generated = `${t("document.generatedAt")}: ${format.dateTime(document.generatedAt)}`;

  for (let index = 0; index < range.count; index += 1) {
    doc.switchToPage(range.start + index);

    const top = doc.page.height - PAGE_MARGIN - 8;

    doc.page.margins.bottom = 0;

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(MUTED)
      .text(generated, PAGE_MARGIN, top, { width, lineBreak: false })
      .text(
        t("document.page", { page: index + 1, pages: range.count }),
        PAGE_MARGIN,
        top,
        { width, align: "right", lineBreak: false },
      );
  }
};
