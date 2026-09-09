import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { normalizeCourseDurationMinutes } from "@utils/course-normalizer.util";
import { InternalServerErrorException } from "@nestjs/common";
import { detectCourseSourcePlatform } from "@utils/course-normalizer.util";
import { normalizeCourseStringList } from "@utils/course-normalizer.util";
import { cleanCourseOptionalText } from "@utils/course-normalizer.util";
import { cleanCourseRequiredText } from "@utils/course-normalizer.util";
import { normalizeCourseCategory } from "@utils/course-normalizer.util";
import { resolveCourseInstructor } from "@utils/course-normalizer.util";
import { cleanCourseDescription } from "@utils/course-normalizer.util";
import { normalizeCourseBoolean } from "@utils/course-normalizer.util";
import { normalizeCourseInteger } from "@utils/course-normalizer.util";
import { normalizeCourseNumber } from "@utils/course-normalizer.util";
import { resolveCourseCurrency } from "@utils/course-normalizer.util";
import { CourseStatus, Prisma } from "@prisma/client";
import { normalizeCourseLevel } from "@utils/course-normalizer.util";
import { normalizeCourseDate } from "@utils/course-normalizer.util";
import { TCourseImportResult } from "@course/types/course-import.types";
import { TCrawledCourseRow } from "@course/types/course-import.types";
import { TCourseRequester } from "@course/types/course-service.type";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import { createHash } from "crypto";
import { Readable } from "node:stream";
import { Role } from "@prisma/client";

import * as ExcelJS from "exceljs";
import "multer";
import { slugify as toSlug } from "@utils/slug.util";

const SLUG_COLLISION_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "P2002";

@Injectable()
export class CourseImportService {
  private readonly batchSize = 100;
  private readonly logger = new Logger(CourseImportService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async importCoursesFromExcel(
    file: Express.Multer.File,
    requester: TCourseRequester,
    options?: {
      defaultStatus?: CourseStatus;
      defaultSourcePlatform?: string;
    },
  ): Promise<TCourseImportResult> {
    if (requester.role !== Role.ADMIN)
      throw new BadRequestException("Only admin can import crawled courses.");
    if (!file?.buffer?.length)
      throw new BadRequestException("Excel file is required.");
    const workbook = new ExcelJS.Workbook();
    try {
      const excelStream = Readable.from([file.buffer]);
      await workbook.xlsx.read(excelStream);
    } catch {
      throw new BadRequestException("Invalid Excel file.");
    }
    const worksheet = workbook.worksheets[0];
    if (!worksheet)
      throw new BadRequestException("Excel file has no worksheet.");
    const rows = this.parseWorksheet(worksheet, {
      defaultStatus: options?.defaultStatus ?? CourseStatus.PUBLISHED,
      defaultSourcePlatform: options?.defaultSourcePlatform ?? "COURSERA",
    });
    const result: TCourseImportResult = {
      totalRows: rows.length,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
    const validRows: TCrawledCourseRow[] = [];
    for (const row of rows) {
      const validationError = this.validateRow(row);
      if (validationError) {
        result.skipped += 1;
        result.errors.push({
          rowNumber: row.rowNumber,
          reason: validationError,
        });
        continue;
      }
      validRows.push(row);
    }
    for (let index = 0; index < validRows.length; index += this.batchSize) {
      const chunk = validRows.slice(index, index + this.batchSize);
      const batchResult = await this.processChunk(chunk);
      result.created += batchResult.created;
      result.updated += batchResult.updated;
      result.failed += batchResult.failed;
      result.errors.push(...batchResult.errors);
    }
    return result;
  }

  private async processChunk(rows: TCrawledCourseRow[]) {
    const result = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as Array<{
        rowNumber: number;
        reason: string;
      }>,
    };
    for (const row of rows) {
      try {
        const outcome = await this.persistCourse(
          row,
          this.buildExternalRef(row),
        );
        if (outcome === "created") result.created += 1;
        else result.updated += 1;
      } catch (error) {
        result.failed += 1;
        result.errors.push({
          rowNumber: row.rowNumber,
          reason:
            error instanceof Error ? error.message : "Unknown import error.",
        });
      }
    }
    return result;
  }

  private async persistCourse(
    row: TCrawledCourseRow,
    externalRef: string,
  ): Promise<"created" | "updated"> {
    const update = this.buildUpdateData(row);

    const claimed = await this.prismaService.course.updateMany({
      where: { externalRef },
      data: update,
    });
    if (claimed.count > 0) return "updated";

    const baseSlug = this.buildStableSlug(row);
    for (let attempt = 0; attempt < SLUG_COLLISION_ATTEMPTS; attempt += 1) {
      try {
        await this.prismaService.course.create({
          data: {
            ...update,
            externalRef,
            slug: this.buildSlugCandidate(baseSlug, externalRef, attempt),
            isFeatured: false,
            providerId: null,
            userId: null,
          },
        });
        return "created";
      } catch (error) {
        const conflicted = this.uniqueViolationTargets(error);
        if (!conflicted) throw error;
        if (conflicted.includes("externalRef")) {
          this.logRecoveredConflict(externalRef);
          await this.prismaService.course.updateMany({
            where: { externalRef },
            data: update,
          });
          return "updated";
        }
        if (!conflicted.includes("slug")) throw error;
      }
    }
    throw this.importFailure(
      `Could not find a free slug for "${baseSlug}" after ${SLUG_COLLISION_ATTEMPTS} attempts.`,
    );
  }

  private buildUpdateData(row: TCrawledCourseRow) {
    const isFree = row.isFree ?? (!row.price || row.price <= 0);
    return {
      title: cleanCourseRequiredText(row.title),
      instructor: resolveCourseInstructor(row),
      imageUrl: cleanCourseOptionalText(row.imageUrl),
      description: cleanCourseDescription(row.description),
      category: row.category ?? normalizeCourseCategory(null),
      level: row.level ?? normalizeCourseLevel(null),
      status: row.status ?? CourseStatus.PUBLISHED,
      price: isFree ? null : new Prisma.Decimal(row.price ?? 0),
      currency: resolveCourseCurrency(row.currency),
      isFree,
      durationMinutes: row.durationMinutes ?? null,
      lastUpdatedAt: row.lastUpdatedAt ?? new Date(),
      requirements: row.requirements ?? [],
      learnings: row.learnings ?? [],
      rating: row.rating ?? 0,
      ratingCount: row.ratingCount ?? 0,
      professionals: row.professionals ?? 0,
      deletedAt: null,
    };
  }

  private buildSlugCandidate(
    baseSlug: string,
    externalRef: string,
    attempt: number,
  ) {
    if (attempt === 0) return baseSlug;
    const discriminator = this.hashValue(externalRef).slice(0, 6);
    if (attempt === 1) return `${baseSlug}-${discriminator}`;
    return `${baseSlug}-${discriminator}-${attempt}`;
  }

  private uniqueViolationTargets(error: unknown): string[] | null {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== UNIQUE_VIOLATION
    )
      return null;
    const target = error.meta?.target;
    if (Array.isArray(target)) return target.map(String);
    if (typeof target === "string") return [target];
    return [];
  }

  private logRecoveredConflict(externalRef: string) {
    this.logger.warn(
      `Recovered a unique violation while importing ${externalRef}.`,
      { correlationId: requestContext.correlationId(), externalRef },
    );
  }

  private importFailure(message: string) {
    return new InternalServerErrorException(message);
  }

  private parseWorksheet(
    worksheet: ExcelJS.Worksheet,
    options: {
      defaultStatus: CourseStatus;
      defaultSourcePlatform: string;
    },
  ): TCrawledCourseRow[] {
    const rows: TCrawledCourseRow[] = [];
    worksheet.eachRow((excelRow, rowNumber) => {
      const values = excelRow.values as unknown[];
      if (rowNumber === 1 && this.looksLikeHeader(values)) return;
      const cells = values.slice(1).map((value) => this.cellToString(value));
      if (cells.every((cell) => !cell)) return;
      const rawData = this.buildRawData(cells);
      rows.push({
        rowNumber,
        externalCourseId: cells[0],
        title: cells[1],
        category: normalizeCourseCategory(cells[2]),
        level: normalizeCourseLevel(cells[3]),
        instructor: cells[4],
        price: normalizeCourseNumber(cells[5]),
        durationMinutes: normalizeCourseDurationMinutes(cells[6]),
        isFree: normalizeCourseBoolean(cells[7]),
        rating: normalizeCourseNumber(cells[8]),
        currency: cells[9] || "USD",
        sourceUrl: cells[10],
        imageUrl: cells[11],
        description: cells[12],
        sourcePlatform:
          detectCourseSourcePlatform(cells[10]) ??
          options.defaultSourcePlatform,
        lastUpdatedAt: normalizeCourseDate(cells[15]) ?? new Date(),
        status: options.defaultStatus,
        requirements: normalizeCourseStringList(cells[16]),
        learnings: normalizeCourseStringList(cells[17]),
        ratingCount: normalizeCourseInteger(cells[18]),
        professionals: normalizeCourseInteger(cells[19]),
        rawData,
      });
    });
    return rows;
  }

  private buildRawData(cells: string[]) {
    return {
      externalCourseId: cells[0],
      title: cells[1],
      category: cells[2],
      level: cells[3],
      instructor: cells[4],
      price: cells[5],
      duration: cells[6],
      isFree: cells[7],
      rating: cells[8],
      currency: cells[9],
      sourceUrl: cells[10],
      imageUrl: cells[11],
      description: cells[12],
      rawCategory: cells[13],
      rawLevel: cells[14],
      lastUpdatedAt: cells[15],
      requirements: cells[16],
      learnings: cells[17],
      ratingCount: cells[18],
      professionals: cells[19],
    };
  }

  private validateRow(row: TCrawledCourseRow): string | null {
    if (!row.title?.trim()) return "Missing title.";
    if (!toSlug(row.externalCourseId ?? ""))
      return "Missing a usable externalCourseId, which is the only stable identity a re-crawl can match on.";
    if (!row.description?.trim()) return "Missing description.";
    return null;
  }

  private buildExternalRef(row: TCrawledCourseRow) {
    const source = (row.sourcePlatform || "EXTERNAL")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!source) throw this.importFailure("Could not resolve a course source.");
    return `${source}:${this.slugify(row.externalCourseId ?? "")}`;
  }

  private buildStableSlug(row: TCrawledCourseRow) {
    const platform = this.slugify(row.sourcePlatform || "external");
    return this.slugify(`${platform}-${row.externalCourseId}`);
  }

  private cellToString(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "object") {
      const richTextValue = value as {
        text?: string;
        result?: string | number;
        hyperlink?: string;
      };
      if (richTextValue.hyperlink) return String(richTextValue.hyperlink);
      if (richTextValue.text) return String(richTextValue.text);
      if (richTextValue.result !== undefined)
        return String(richTextValue.result);
    }
    return String(value).trim();
  }

  private looksLikeHeader(values: unknown[]) {
    const normalized = values
      .slice(1)
      .map((value) => this.cellToString(value).toLowerCase());
    return (
      normalized.includes("title") ||
      normalized.includes("course title") ||
      normalized.includes("sourceurl") ||
      normalized.includes("source url")
    );
  }

  private hashValue(value: string) {
    return createHash("sha1").update(value).digest("hex").slice(0, 10);
  }

  private slugify(value: string) {
    const slug = toSlug(value);
    if (!slug)
      throw new InternalServerErrorException("Could not generate course slug.");
    return slug;
  }
}
