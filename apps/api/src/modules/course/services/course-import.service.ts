import { CourseLevel, CourseStatus, Prisma } from "@prisma/client";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";
import { CourseCategory, Role } from "@prisma/client";
import { TCourseImportResult } from "@course/types/course-import.types";
import { TCrawledCourseRow } from "@course/types/course-import.types";
import { TCourseRequester } from "@course/types/course-service.type";
import { PrismaService } from "@prisma/prisma.service";
import { createHash } from "crypto";
import { Readable } from "node:stream";

import sanitizeHtml from "sanitize-html";

import * as ExcelJS from "exceljs";
import "multer";

@Injectable()
export class CourseImportService {
  private readonly batchSize = 100;
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
        const slug = this.buildStableSlug(row);
        const existing = await this.prismaService.course.findUnique({
          where: { slug },
          select: { id: true },
        });
        const isFree = row.isFree ?? (!row.price || row.price <= 0);
        const data = {
          slug,
          title: this.cleanRequiredText(row.title),
          instructor: this.resolveInstructor(row),
          imageUrl: this.cleanOptionalText(row.imageUrl),
          description: this.cleanDescription(row.description),
          category: row.category ?? CourseCategory.OTHER,
          level: row.level ?? CourseLevel.ALL_LEVELS,
          status: row.status ?? CourseStatus.PUBLISHED,
          price: isFree ? null : new Prisma.Decimal(row.price ?? 0),
          currency: this.resolveCurrency(row.currency),
          isFree,
          durationMinutes: row.durationMinutes ?? null,
          lastUpdatedAt: row.lastUpdatedAt ?? new Date(),
          requirements: row.requirements ?? [],
          learnings: row.learnings ?? [],
          rating: row.rating ?? 0,
          ratingCount: row.ratingCount ?? 0,
          professionals: row.professionals ?? 0,
          isFeatured: false,
          providerId: null,
          userId: null,
          deletedAt: null,
        };

        await this.prismaService.course.upsert({
          where: { slug },
          create: data,
          update: {
            title: data.title,
            instructor: data.instructor,
            imageUrl: data.imageUrl,
            description: data.description,
            category: data.category,
            level: data.level,
            status: data.status,
            price: data.price,
            currency: data.currency,
            isFree: data.isFree,
            durationMinutes: data.durationMinutes,
            lastUpdatedAt: data.lastUpdatedAt,
            requirements: data.requirements,
            learnings: data.learnings,
            rating: data.rating,
            ratingCount: data.ratingCount,
            professionals: data.professionals,
            deletedAt: null,
          },
        });
        if (existing) result.updated += 1;
        else result.created += 1;
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
        category: this.normalizeCategory(cells[2]),
        level: this.normalizeLevel(cells[3]),
        instructor: cells[4],
        price: this.normalizeNumber(cells[5]),
        durationMinutes: this.normalizeDurationMinutes(cells[6]),
        isFree: this.normalizeBoolean(cells[7]),
        rating: this.normalizeNumber(cells[8]),
        currency: cells[9] || "USD",
        sourceUrl: cells[10],
        imageUrl: cells[11],
        description: cells[12],
        sourcePlatform:
          this.detectSourcePlatform(cells[10]) ?? options.defaultSourcePlatform,
        lastUpdatedAt: this.normalizeDate(cells[15]) ?? new Date(),
        status: options.defaultStatus,
        requirements: this.normalizeStringList(cells[16]),
        learnings: this.normalizeStringList(cells[17]),
        ratingCount: this.normalizeInteger(cells[18]),
        professionals: this.normalizeInteger(cells[19]),
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
    if (!row.sourceUrl?.trim() && !row.externalCourseId?.trim())
      return "Missing both sourceUrl and externalCourseId.";
    if (!row.description?.trim()) return "Missing description.";
    return null;
  }

  private buildStableSlug(row: TCrawledCourseRow) {
    const platform = this.slugify(row.sourcePlatform || "external");
    if (row.externalCourseId?.trim())
      return this.slugify(`${platform}-${row.externalCourseId}`);
    const urlHash = this.hashValue(row.sourceUrl || row.title || "");
    return this.slugify(`${platform}-${row.title}-${urlHash}`);
  }

  private resolveInstructor(row: TCrawledCourseRow) {
    const instructor = row.instructor?.trim();
    if (instructor) return instructor;
    if (row.sourcePlatform?.toUpperCase() === "COURSERA") return "Coursera";
    if (row.sourcePlatform?.toUpperCase() === "UDEMY") return "Udemy";
    if (row.sourcePlatform?.toUpperCase() === "EDX") return "edX";
    return "External Provider";
  }

  private resolveCurrency(currency?: string | null) {
    const value = currency?.trim().toUpperCase();
    if (!value) return "USD";
    return value.slice(0, 3);
  }

  private cleanRequiredText(value?: string | null) {
    return value?.trim() || "Untitled Course";
  }

  private cleanOptionalText(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned || null;
  }

  private cleanDescription(value?: string | null) {
    const cleaned = sanitizeHtml(value?.trim() || "", {
      allowedTags: [],
      allowedAttributes: {},
    });
    return cleaned || "No description provided.";
  }

  private normalizeCategory(value?: string | null): CourseCategory {
    const normalized = value
      ?.trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
    if (!normalized) return CourseCategory.OTHER;
    const categoryMap: Record<string, CourseCategory> = {
      AI: CourseCategory.TECHNOLOGY,
      DATA: CourseCategory.TECHNOLOGY,
      TECH: CourseCategory.TECHNOLOGY,
      TECHNOLOGY: CourseCategory.TECHNOLOGY,
      COMPUTER_SCIENCE: CourseCategory.TECHNOLOGY,
      SOFTWARE: CourseCategory.TECHNOLOGY,
      PROGRAMMING: CourseCategory.TECHNOLOGY,
      BUSINESS: CourseCategory.BUSINESS,
      MANAGEMENT: CourseCategory.BUSINESS,
      ENTREPRENEURSHIP: CourseCategory.BUSINESS,
      FINANCE: CourseCategory.FINANCE,
      ACCOUNTING: CourseCategory.FINANCE,
      MARKETING: CourseCategory.MARKETING,
      SALES: CourseCategory.MARKETING,
      ENGINEERING: CourseCategory.ENGINEERING,
      DESIGN: CourseCategory.DESIGN,
      EDUCATION: CourseCategory.EDUCATION,
      HEALTHCARE: CourseCategory.HEALTHCARE,
      LEADERSHIP: CourseCategory.LEADERSHIP,
      COMPLIANCE: CourseCategory.COMPLIANCE,
      CPD: CourseCategory.CPD,
    };
    if (normalized in CourseCategory) return normalized as CourseCategory;
    return categoryMap[normalized] ?? CourseCategory.OTHER;
  }

  private normalizeLevel(value?: string | null): CourseLevel {
    const normalized = value
      ?.trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
    if (!normalized) return CourseLevel.ALL_LEVELS;
    const levelMap: Record<string, CourseLevel> = {
      BEGINNER: CourseLevel.BEGINNER,
      BASIC: CourseLevel.BEGINNER,
      INTRODUCTORY: CourseLevel.BEGINNER,
      INTERMEDIATE: CourseLevel.INTERMEDIATE,
      MEDIUM: CourseLevel.INTERMEDIATE,
      ADVANCED: CourseLevel.ADVANCED,
      EXPERT: CourseLevel.ADVANCED,
      ALL: CourseLevel.ALL_LEVELS,
      ALL_LEVELS: CourseLevel.ALL_LEVELS,
      MIXED: CourseLevel.ALL_LEVELS,
    };
    return levelMap[normalized] ?? CourseLevel.ALL_LEVELS;
  }

  private normalizeBoolean(value?: string | null): boolean | null {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) return null;
    if (["yes", "true", "free", "1"].includes(normalized)) return true;
    if (["no", "false", "paid", "0"].includes(normalized)) return false;
    return null;
  }

  private normalizeNumber(value?: string | null): number | null {
    if (!value) return null;
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const number = Number(cleaned);
    return Number.isFinite(number) ? number : null;
  }

  private normalizeInteger(value?: string | null): number {
    const number = this.normalizeNumber(value);
    return number ? Math.max(0, Math.round(number)) : 0;
  }

  private normalizeDurationMinutes(value?: string | null): number | null {
    if (!value) return null;
    const normalized = value.toLowerCase().trim();
    const hourMatch = normalized.match(
      /(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs|h)/,
    );
    const minuteMatch = normalized.match(/(\d+)\s*(minute|minutes|min|mins|m)/);
    let minutes = 0;
    if (hourMatch) minutes += Math.round(Number(hourMatch[1]) * 60);
    if (minuteMatch) minutes += Number(minuteMatch[1]);
    if (minutes > 0) return minutes;
    const directNumber = this.normalizeNumber(normalized);
    return directNumber ? Math.round(directNumber) : null;
  }

  private normalizeDate(value?: string | null): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  private normalizeStringList(value?: string | null): string[] {
    if (!value?.trim()) return [];
    return value
      .split(/\n|;|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private detectSourcePlatform(sourceUrl?: string | null): string | null {
    const url = sourceUrl?.toLowerCase();
    if (!url) return null;
    if (url.includes("coursera.org")) return "COURSERA";
    if (url.includes("udemy.com")) return "UDEMY";
    if (url.includes("edx.org")) return "EDX";
    if (url.includes("linkedin.com")) return "LINKEDIN_LEARNING";
    return "OTHER";
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
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!slug)
      throw new InternalServerErrorException("Could not generate course slug.");
    return slug;
  }
}
