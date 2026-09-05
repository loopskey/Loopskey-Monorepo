import { type ReportExportDataset } from "@association/types/association-report-export.types";
import { type ReportExportDocument } from "@association/types/association-report-export.types";
import { writeReportWorkbook } from "@association/utils/association-report-excel.writer";
import { writeReportPdf } from "@association/utils/association-report-pdf.writer";

import * as ExcelJS from "exceljs";

const LARGE_ROW_COUNT = 5000;

const columns: ReportExportDataset["columns"] = [
  { key: "member", label: "Member", kind: "text", weight: 4 },
  { key: "completion", label: "Completion", kind: "percent", weight: 2 },
  { key: "credits", label: "Credits earned", kind: "decimal", weight: 2 },
  { key: "awaiting", label: "Awaiting review", kind: "integer", weight: 2 },
  { key: "deadline", label: "Earliest deadline", kind: "date", weight: 3 },
];

const dataset = (rowCount: number, title = "Member progress") => ({
  title,
  columns,
  answer: "Who is ahead and who is behind, member by member.",
  rows: Array.from({ length: rowCount }, (_, index) => ({
    member: `Member ${index + 1}`,
    completion: 42.5,
    credits: 6.25,
    awaiting: index % 3,
    deadline: new Date("2026-12-31T00:00:00.000Z"),
  })),
  summary: [{ label: "Members", value: String(rowCount) }],
  filterLines: [{ label: "Period", value: "This year" }],
  totalRows: rowCount,
  isTruncated: false,
});

const document = (
  rowCount: number,
  locale = "en",
  title?: string,
): ReportExportDocument => ({
  locale,
  associationName: "Institute of Practice",
  associationLogoUrl: null,
  generatedAt: new Date("2026-09-05T09:00:00.000Z"),
  dataset: dataset(rowCount, title),
});

describe("the report workbook writer", () => {
  it("types every cell and reopens without repair for five thousand rows", async () => {
    const file = await writeReportWorkbook(document(LARGE_ROW_COUNT));

    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(file);

    const sheet = reopened.getWorksheet("Report");

    expect(sheet).toBeDefined();
    expect(sheet!.rowCount).toBe(LARGE_ROW_COUNT + 1);

    const first = sheet!.getRow(2);

    expect(typeof first.getCell(1).value).toBe("string");
    expect(first.getCell(2).value).toBeCloseTo(0.425, 6);
    expect(first.getCell(2).numFmt).toBe("0.00%");
    expect(first.getCell(3).value).toBe(6.25);
    expect(first.getCell(3).numFmt).toBe("0.00");
    expect(first.getCell(4).numFmt).toBe("0");
    expect(first.getCell(5).value).toBeInstanceOf(Date);
    expect(first.getCell(5).numFmt).toBe("dd/mm/yyyy");
  });

  it("freezes the header and offers an auto-filter over it", async () => {
    const file = await writeReportWorkbook(document(3));

    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(file);

    const sheet = reopened.getWorksheet("Report")!;

    expect(sheet.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });
    expect(sheet.autoFilter).toBe("A1:E1");
  });

  it("names the filter and the generation time on a second sheet", async () => {
    const file = await writeReportWorkbook(document(2));

    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(file);

    const meta = reopened.getWorksheet("Filter")!;
    const text = meta
      .getSheetValues()
      .flatMap((row) => (Array.isArray(row) ? row : []))
      .map((value) => (value instanceof Date ? value.toISOString() : value))
      .join(" ");

    expect(text).toContain("Period");
    expect(text).toContain("This year");
    expect(text).toContain("2026-09-05T09:00:00.000Z");
  });

  it("uses the French sheet names for a French request", async () => {
    const file = await writeReportWorkbook(document(1, "fr"));

    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(file);

    expect(reopened.getWorksheet("Rapport")).toBeDefined();
    expect(reopened.getWorksheet("Filtre")).toBeDefined();
  });
});

describe("the report PDF writer", () => {
  it("produces a complete document", async () => {
    const file = await writeReportPdf(document(3));

    expect(file.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(file.toString("latin1")).toContain("%%EOF");
  });

  it("carries the report title in its metadata", async () => {
    const file = await writeReportPdf(
      document(3, "fr", "Progression des membres"),
    );

    expect(file.toString("latin1")).toContain("Progression des membres");
  });

  it("grows into more pages as the report grows", async () => {
    const short = await writeReportPdf(document(5));
    const long = await writeReportPdf(document(500));

    expect(long.byteLength).toBeGreaterThan(short.byteLength);
    expect(long.toString("latin1")).toContain("/Type /Page");
  });
});
