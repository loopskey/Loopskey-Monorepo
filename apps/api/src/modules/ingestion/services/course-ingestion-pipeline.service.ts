import { validateSync, type ValidationError } from "class-validator";
import { normalizeCourseDurationMinutes } from "@utils/course-normalizer.util";
import { COURSE_PROTECTED_INPUT_FIELDS } from "@ingestion/enums/course-ingestion.constant";
import { normalizeCourseStringList } from "@utils/course-normalizer.util";
import { normalizeCourseCategory } from "@utils/course-normalizer.util";
import { resolveCourseInstructor } from "@utils/course-normalizer.util";
import { COURSE_CANONICAL_FIELDS } from "@ingestion/enums/course-ingestion.constant";
import { normalizeCourseBoolean } from "@utils/course-normalizer.util";
import { normalizeCourseNumber } from "@utils/course-normalizer.util";
import { resolveCourseCurrency } from "@utils/course-normalizer.util";
import { CanonicalCourseInput } from "@ingestion/dtos/canonical-course.input";
import { normalizeCourseLevel } from "@utils/course-normalizer.util";
import { normalizeCourseDate } from "@utils/course-normalizer.util";
import { sanitizeCourseText } from "@utils/course-normalizer.util";
import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";

import type { CourseCanonicalField } from "@ingestion/types/course-ingestion.types";
import type { PreparedCourseItem } from "@ingestion/types/course-ingestion.types";
import type { CourseFieldMap } from "@ingestion/types/course-ingestion.types";

const protectedFields = new Set<string>(COURSE_PROTECTED_INPUT_FIELDS);

const toText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (["string", "number", "boolean"].includes(typeof value))
    return String(value);
  return null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return normalizeCourseNumber(toText(value));
};

const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  return normalizeCourseBoolean(toText(value));
};

const toDate = (value: unknown): string | null => {
  const parsed =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : normalizeCourseDate(toText(value));
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value))
    return value.map(toText).filter((entry): entry is string => entry !== null);
  return normalizeCourseStringList(toText(value));
};

const validationReason = (errors: ValidationError[]) => {
  const reasons = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map(
      (constraint) => `${error.property}: ${constraint}`,
    ),
  );
  return reasons.join("; ") || "The canonical course item is invalid.";
};

@Injectable()
export class CourseIngestionPipeline {
  prepare(
    rawItem: unknown,
    fieldMap: CourseFieldMap,
    includeUnmappedValues: boolean,
  ): PreparedCourseItem {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem))
      return this.rejected(
        null,
        {},
        [],
        undefined,
        "Each course item must be an object.",
      );

    const sourceItem = rawItem as Record<string, unknown>;
    const mappedSourceFields = Object.keys(fieldMap);
    const unmappedFields = Object.keys(sourceItem)
      .filter((field) => !mappedSourceFields.includes(field))
      .sort();
    const unmappedValues = includeUnmappedValues
      ? Object.fromEntries(
          unmappedFields.map((field) => [field, sourceItem[field]]),
        )
      : undefined;
    const mapped = this.map(sourceItem, fieldMap);
    const coerced = this.coerce(mapped);
    const sanitized = this.sanitize(coerced);
    const canonical = Object.assign(new CanonicalCourseInput(), sanitized);
    const externalId =
      typeof canonical.externalId === "string" && canonical.externalId
        ? canonical.externalId
        : null;
    const canonicalHash = this.hash(sanitized);
    const protectedField = Object.keys(sourceItem).find((field) =>
      protectedFields.has(field),
    );
    if (protectedField)
      return this.rejected(
        externalId,
        sanitized,
        unmappedFields,
        unmappedValues,
        `${protectedField} is owned by the platform and cannot be supplied.`,
      );
    const errors = validateSync(canonical, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
    });
    if (errors.length > 0)
      return this.rejected(
        externalId,
        sanitized,
        unmappedFields,
        unmappedValues,
        validationReason(errors),
      );

    return {
      outcome: "accepted",
      canonical,
      canonicalHash,
      externalId: canonical.externalId,
      unmappedFields,
      ...(unmappedValues ? { unmappedValues } : {}),
    };
  }

  private map(source: Record<string, unknown>, fieldMap: CourseFieldMap) {
    const mapped: Partial<Record<CourseCanonicalField, unknown>> = {};
    for (const [sourceField, targetField] of Object.entries(fieldMap))
      if (Object.prototype.hasOwnProperty.call(source, sourceField))
        mapped[targetField] = source[sourceField];
    return mapped;
  }

  private coerce(mapped: Partial<Record<CourseCanonicalField, unknown>>) {
    const price = toNumber(mapped.price);
    const statedIsFree = toBoolean(mapped.isFree);
    const isFree = statedIsFree ?? (!price || price <= 0);
    const sourcePlatform = toText(mapped.sourcePlatform);
    const durationMinutes =
      typeof mapped.durationMinutes === "number"
        ? Math.round(mapped.durationMinutes)
        : normalizeCourseDurationMinutes(toText(mapped.durationMinutes));

    return {
      externalId: toText(mapped.externalId),
      canonicalUrl: toText(mapped.canonicalUrl),
      sourcePlatform,
      title: toText(mapped.title),
      description: toText(mapped.description),
      instructor: resolveCourseInstructor({
        instructor: toText(mapped.instructor),
        sourcePlatform,
      }),
      imageCandidateUrl: toText(mapped.imageCandidateUrl),
      category: normalizeCourseCategory(toText(mapped.category)),
      level: normalizeCourseLevel(toText(mapped.level)),
      requirements: toStringList(mapped.requirements),
      learnings: toStringList(mapped.learnings),
      price: isFree ? null : price,
      currency: resolveCourseCurrency(toText(mapped.currency)),
      isFree,
      durationMinutes,
      lastUpdatedAt: toDate(mapped.lastUpdatedAt),
      rawCategory: toText(mapped.rawCategory),
      rawLevel: toText(mapped.rawLevel),
      rawDuration: toText(mapped.rawDuration),
      language: toText(mapped.language),
      contentType: toText(mapped.contentType),
      internalCategory: toText(mapped.internalCategory),
      offersCertificate: toBoolean(mapped.offersCertificate),
      creditValue: toNumber(mapped.creditValue),
      creditSource: toText(mapped.creditSource),
      creditConfidence: toNumber(mapped.creditConfidence),
      crawledAt: toDate(mapped.crawledAt),
      updatedAt: toDate(mapped.updatedAt),
    };
  }

  private sanitize(coerced: Record<CourseCanonicalField, unknown>) {
    const sanitized: Partial<Record<CourseCanonicalField, unknown>> = {};
    for (const field of COURSE_CANONICAL_FIELDS) {
      const value = coerced[field];
      if (typeof value === "string") {
        sanitized[field] = sanitizeCourseText(value) || null;
        continue;
      }
      if (Array.isArray(value)) {
        sanitized[field] = value
          .map((entry) => sanitizeCourseText(String(entry)))
          .filter(Boolean);
        continue;
      }
      sanitized[field] = value;
    }
    return sanitized;
  }

  private hash(canonical: Partial<Record<CourseCanonicalField, unknown>>) {
    const ordered = Object.fromEntries(
      COURSE_CANONICAL_FIELDS.map((field) => [field, canonical[field] ?? null]),
    );
    return createHash("sha256").update(JSON.stringify(ordered)).digest("hex");
  }

  private rejected(
    externalId: string | null,
    canonical: Partial<Record<CourseCanonicalField, unknown>>,
    unmappedFields: string[],
    unmappedValues: Record<string, unknown> | undefined,
    reason: string,
  ): PreparedCourseItem {
    return {
      outcome: "rejected",
      externalId,
      canonicalHash: this.hash(canonical),
      reason,
      unmappedFields,
      ...(unmappedValues ? { unmappedValues } : {}),
    };
  }
}
