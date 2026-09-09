import { CourseImportService } from "@course/services/course-import.service";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";

import * as ExcelJS from "exceljs";

const HEADERS = [
  "externalCourseId",
  "title",
  "category",
  "level",
  "instructor",
  "price",
  "duration",
  "isFree",
  "rating",
  "currency",
  "sourceUrl",
  "imageUrl",
  "description",
  "rawCategory",
  "rawLevel",
  "lastUpdatedAt",
  "requirements",
  "learnings",
  "ratingCount",
  "professionals",
];

type SheetRow = Partial<Record<(typeof HEADERS)[number], string>>;

const buildWorkbook = async (rows: SheetRow[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("courses");
  sheet.addRow(HEADERS);
  for (const row of rows)
    sheet.addRow(HEADERS.map((header) => row[header] ?? ""));
  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer) } as Express.Multer.File;
};

const uniqueViolation = (target: string[]) =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
    meta: { target },
  });

const admin = { id: "admin-1", role: Role.ADMIN };

const courseRow: SheetRow = {
  externalCourseId: "ML-101",
  title: "Applied Machine Learning",
  sourceUrl: "https://www.coursera.org/learn/applied-ml",
  description: "Learn applied machine learning.",
};

describe("CourseImportService", () => {
  const course = {
    updateMany: jest.fn(),
    create: jest.fn(),
  };
  const prisma = { course } as unknown as PrismaService;
  const service = new CourseImportService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    course.updateMany.mockResolvedValue({ count: 0 });
    course.create.mockResolvedValue({ id: "course-1" });
  });

  it("keys a new row on the namespaced external reference, not the slug", async () => {
    const file = await buildWorkbook([courseRow]);

    const result = await service.importCoursesFromExcel(file, admin);

    expect(result.created).toBe(1);
    expect(course.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { externalRef: "COURSERA:ml-101" } }),
    );
    expect(course.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          externalRef: "COURSERA:ml-101",
          slug: "coursera-ml-101",
        }),
      }),
    );
  });

  it("updates an existing row without touching its slug", async () => {
    course.updateMany.mockResolvedValue({ count: 1 });
    const file = await buildWorkbook([
      { ...courseRow, title: "Applied Machine Learning, Second Edition" },
    ]);

    const result = await service.importCoursesFromExcel(file, admin);

    expect(result.updated).toBe(1);
    expect(result.created).toBe(0);
    expect(course.create).not.toHaveBeenCalled();
    const [[updateArgs]] = course.updateMany.mock.calls;
    expect(updateArgs.data).not.toHaveProperty("slug");
    expect(updateArgs.data.title).toBe(
      "Applied Machine Learning, Second Edition",
    );
  });

  it("rejects a row with no usable external id and persists nothing for it", async () => {
    const file = await buildWorkbook([
      { ...courseRow, externalCourseId: "" },
      { ...courseRow, externalCourseId: "###" },
    ]);

    const result = await service.importCoursesFromExcel(file, admin);

    expect(result.skipped).toBe(2);
    expect(result.created).toBe(0);
    expect(course.create).not.toHaveBeenCalled();
    expect(course.updateMany).not.toHaveBeenCalled();
    expect(result.errors).toHaveLength(2);
    for (const error of result.errors)
      expect(error.reason).toContain("externalCourseId");
  });

  it("produces a distinct slug when the generated one is already taken", async () => {
    course.create
      .mockRejectedValueOnce(uniqueViolation(["slug"]))
      .mockResolvedValueOnce({ id: "course-1" });
    const file = await buildWorkbook([courseRow]);

    const result = await service.importCoursesFromExcel(file, admin);

    expect(result.created).toBe(1);
    expect(course.create).toHaveBeenCalledTimes(2);
    const slugs = course.create.mock.calls.map(([args]) => args.data.slug);
    expect(slugs[0]).toBe("coursera-ml-101");
    expect(slugs[1]).toMatch(/^coursera-ml-101-[0-9a-f]{6}$/);
    expect(new Set(slugs).size).toBe(2);
  });

  it("recovers from a lost external reference race by updating the winning row", async () => {
    course.create.mockRejectedValueOnce(uniqueViolation(["externalRef"]));
    course.updateMany
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });
    const file = await buildWorkbook([courseRow]);

    const result = await service.importCoursesFromExcel(file, admin);

    expect(result.updated).toBe(1);
    expect(result.created).toBe(0);
    expect(result.failed).toBe(0);
    expect(course.updateMany).toHaveBeenCalledTimes(2);
    expect(course.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { externalRef: "COURSERA:ml-101" } }),
    );
  });

  it("reports the same rows as updated when the same sheet is imported twice", async () => {
    const file = await buildWorkbook([courseRow]);

    const first = await service.importCoursesFromExcel(file, admin);
    course.updateMany.mockResolvedValue({ count: 1 });
    const second = await service.importCoursesFromExcel(file, admin);

    expect(first.created).toBe(1);
    expect(second.created).toBe(0);
    expect(second.updated).toBe(1);
    expect(second.totalRows).toBe(first.totalRows);
  });

  it("namespaces the reference by source so two sources may share an id", async () => {
    const file = await buildWorkbook([
      courseRow,
      {
        ...courseRow,
        sourceUrl: "https://www.udemy.com/course/applied-ml",
      },
    ]);

    await service.importCoursesFromExcel(file, admin);

    const refs = course.create.mock.calls.map(
      ([args]) => args.data.externalRef,
    );
    expect(refs).toEqual(["COURSERA:ml-101", "UDEMY:ml-101"]);
  });

  it("restores a soft-deleted row rather than creating a second one", async () => {
    course.updateMany.mockResolvedValue({ count: 1 });
    const file = await buildWorkbook([courseRow]);

    await service.importCoursesFromExcel(file, admin);

    const [[updateArgs]] = course.updateMany.mock.calls;
    expect(updateArgs.data.deletedAt).toBeNull();
    expect(course.create).not.toHaveBeenCalled();
  });
});
