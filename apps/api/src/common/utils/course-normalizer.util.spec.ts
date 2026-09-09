import { CourseCategory, CourseLevel } from "@prisma/client";

import {
  detectCourseSourcePlatform,
  normalizeCourseBoolean,
  normalizeCourseCategory,
  normalizeCourseDate,
  normalizeCourseDurationMinutes,
  normalizeCourseInteger,
  normalizeCourseLevel,
  normalizeCourseNumber,
  normalizeCourseStringList,
  resolveCourseCurrency,
  resolveCourseInstructor,
} from "./course-normalizer.util";

const legacyCategory = (value?: string | null): CourseCategory => {
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
};

const legacyLevel = (value?: string | null): CourseLevel => {
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
};

const legacyBoolean = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (["yes", "true", "free", "1"].includes(normalized)) return true;
  if (["no", "false", "paid", "0"].includes(normalized)) return false;
  return null;
};

const legacyNumber = (value?: string | null) => {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
};

const legacyInteger = (value?: string | null) => {
  const number = legacyNumber(value);
  return number ? Math.max(0, Math.round(number)) : 0;
};

const legacyDuration = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs|h)/);
  const minuteMatch = normalized.match(/(\d+)\s*(minute|minutes|min|mins|m)/);
  let minutes = 0;
  if (hourMatch) minutes += Math.round(Number(hourMatch[1]) * 60);
  if (minuteMatch) minutes += Number(minuteMatch[1]);
  if (minutes > 0) return minutes;
  const directNumber = legacyNumber(normalized);
  return directNumber ? Math.round(directNumber) : null;
};

describe("course normalizer behavior preservation", () => {
  it.each([
    null,
    "AI",
    "computer science",
    "business",
    "sales",
    "healthcare",
    "unknown category",
  ])("preserves category normalization for %p", (value) => {
    expect(normalizeCourseCategory(value)).toBe(legacyCategory(value));
  });

  it.each([
    null,
    "basic",
    "introductory",
    "medium",
    "expert",
    "all levels",
    "unknown",
  ])("preserves level normalization for %p", (value) => {
    expect(normalizeCourseLevel(value)).toBe(legacyLevel(value));
  });

  it.each([null, "yes", "false", "FREE", "0", "unknown"])(
    "preserves boolean normalization for %p",
    (value) => {
      expect(normalizeCourseBoolean(value)).toBe(legacyBoolean(value));
    },
  );

  it.each([null, "$1,299.50", "-2", "not a number", "0"])(
    "preserves number normalization for %p",
    (value) => {
      expect(normalizeCourseNumber(value)).toBe(legacyNumber(value));
      expect(normalizeCourseInteger(value)).toBe(legacyInteger(value));
    },
  );

  it.each([null, "1.5 hours", "2 hrs 15 mins", "45 minutes", "90", "none"])(
    "preserves duration normalization for %p",
    (value) => {
      expect(normalizeCourseDurationMinutes(value)).toBe(legacyDuration(value));
    },
  );

  it("preserves date, list, platform, instructor, and currency rules", () => {
    expect(normalizeCourseDate("2026-09-08")?.toISOString()).toBe(
      new Date("2026-09-08").toISOString(),
    );
    expect(normalizeCourseDate("invalid")).toBeNull();
    expect(normalizeCourseStringList("one; two\nthree|four")).toEqual([
      "one",
      "two",
      "three",
      "four",
    ]);
    expect(detectCourseSourcePlatform("https://www.edx.org/learn/test")).toBe(
      "EDX",
    );
    expect(resolveCourseInstructor({ sourcePlatform: "UDEMY" })).toBe("Udemy");
    expect(resolveCourseCurrency(" cad ")).toBe("CAD");
  });
});
