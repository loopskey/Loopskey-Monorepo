import { CourseImportService } from "@course/services/course-import.service";
import { PrismaService } from "@prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Role } from "@prisma/client";

import * as ExcelJS from "exceljs";

import {
  bootApp,
  fulfilled,
  rejected,
  runTogether,
} from "../setup/concurrency";

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

const SOURCE = "IMPORT_RACE_E2E";
const REF_PREFIX = `${SOURCE}:`;

const admin = { id: "import-race-admin", role: Role.ADMIN };

const unique = () =>
  `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

/**
 * The import under real overlap.
 *
 * The assertion is the row count in PostgreSQL, not which promise rejected: an
 * implementation that preflights with a read and then creates would let both
 * callers through and still report success to both.
 */
describe("Course import identity (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let imports: CourseImportService;

  const sheet = async (externalCourseId: string, title: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("courses");
    worksheet.addRow(HEADERS);
    const values: Record<string, string> = {
      externalCourseId,
      title,
      description: "Concurrent import race.",
      instructor: "Race Runner",
    };
    worksheet.addRow(HEADERS.map((header) => values[header] ?? ""));
    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer: Buffer.from(buffer) } as Express.Multer.File;
  };

  const runImport = (file: Express.Multer.File) =>
    imports.importCoursesFromExcel(file, admin, {
      defaultSourcePlatform: SOURCE,
    });

  const cleanup = () =>
    prisma.course.deleteMany({
      where: { externalRef: { startsWith: REF_PREFIX } },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    imports = app.get(CourseImportService);
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  it("ends with exactly one row when two imports of one external id overlap", async () => {
    const externalCourseId = `race-${unique()}`;
    const externalRef = `${REF_PREFIX}${externalCourseId}`;

    const results = await runTogether(2, (index) =>
      sheet(externalCourseId, `Concurrent import ${index}`).then(runImport),
    );

    expect(rejected(results)).toHaveLength(0);
    expect(fulfilled(results)).toHaveLength(2);
    for (const { value } of fulfilled(results)) expect(value.failed).toBe(0);

    const rows = await prisma.course.findMany({ where: { externalRef } });
    expect(rows).toHaveLength(1);

    const outcomes = fulfilled(results).map(({ value }) => value.created);
    expect(outcomes.reduce((total, created) => total + created, 0)).toBe(1);
  });

  it("keeps the slug and the row stable when a re-import changes the title", async () => {
    const externalCourseId = `rename-${unique()}`;
    const externalRef = `${REF_PREFIX}${externalCourseId}`;

    const first = await runImport(await sheet(externalCourseId, "First title"));
    const created = await prisma.course.findUniqueOrThrow({
      where: { externalRef },
    });

    const second = await runImport(
      await sheet(externalCourseId, "Completely different title"),
    );
    const updated = await prisma.course.findUniqueOrThrow({
      where: { externalRef },
    });

    expect(first.created).toBe(1);
    expect(second.created).toBe(0);
    expect(second.updated).toBe(1);
    expect(updated.id).toBe(created.id);
    expect(updated.slug).toBe(created.slug);
    expect(updated.title).toBe("Completely different title");
    expect(await prisma.course.count({ where: { externalRef } })).toBe(1);
  });

  it("gives a colliding slug a distinct one without losing either identity", async () => {
    const externalCourseId = `collide-${unique()}`;
    const externalRef = `${REF_PREFIX}${externalCourseId}`;
    const takenSlug = `${SOURCE.toLowerCase().replace(/_/g, "-")}-${externalCourseId}`;

    const squatter = await prisma.course.create({
      data: {
        slug: takenSlug,
        externalRef: `${REF_PREFIX}squatter-${unique()}`,
        title: "Squatting on the generated slug",
        instructor: "Squatter",
        description: "Holds the slug the import would generate.",
        category: "OTHER",
      },
    });

    const result = await runImport(
      await sheet(externalCourseId, "Needs a new slug"),
    );
    const imported = await prisma.course.findUniqueOrThrow({
      where: { externalRef },
    });

    expect(result.created).toBe(1);
    expect(result.failed).toBe(0);
    expect(imported.slug).not.toBe(squatter.slug);
    expect(imported.id).not.toBe(squatter.id);
    expect(
      await prisma.course.findUniqueOrThrow({ where: { id: squatter.id } }),
    ).toMatchObject({ slug: takenSlug });
  });

  it("restores a soft-deleted row instead of creating a second one", async () => {
    const externalCourseId = `restore-${unique()}`;
    const externalRef = `${REF_PREFIX}${externalCourseId}`;

    await runImport(await sheet(externalCourseId, "Will be removed"));
    await prisma.course.update({
      where: { externalRef },
      data: { deletedAt: new Date() },
    });

    const result = await runImport(await sheet(externalCourseId, "Back again"));
    const rows = await prisma.course.findMany({ where: { externalRef } });

    expect(result.updated).toBe(1);
    expect(result.created).toBe(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].deletedAt).toBeNull();
  });
});
