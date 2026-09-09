import { CourseCategory, CourseLevel } from "@prisma/client";

import sanitizeHtml from "sanitize-html";

export const cleanCourseRequiredText = (value?: string | null) =>
  value?.trim() || "Untitled Course";

export const cleanCourseOptionalText = (value?: string | null) => {
  const cleaned = value?.trim();
  return cleaned || null;
};

export const sanitizeCourseText = (value?: string | null) =>
  sanitizeHtml(value?.trim() || "", {
    allowedTags: [],
    allowedAttributes: {},
  });

export const cleanCourseDescription = (value?: string | null) =>
  sanitizeCourseText(value) || "No description provided.";

export const normalizeCourseCategory = (
  value?: string | null,
): CourseCategory => {
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

export const normalizeCourseLevel = (value?: string | null): CourseLevel => {
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

export const normalizeCourseBoolean = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (["yes", "true", "free", "1"].includes(normalized)) return true;
  if (["no", "false", "paid", "0"].includes(normalized)) return false;
  return null;
};

export const normalizeCourseNumber = (value?: string | null) => {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
};

export const normalizeCourseInteger = (value?: string | null) => {
  const number = normalizeCourseNumber(value);
  return number ? Math.max(0, Math.round(number)) : 0;
};

export const normalizeCourseDurationMinutes = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs|h)/);
  const minuteMatch = normalized.match(/(\d+)\s*(minute|minutes|min|mins|m)/);
  let minutes = 0;
  if (hourMatch) minutes += Math.round(Number(hourMatch[1]) * 60);
  if (minuteMatch) minutes += Number(minuteMatch[1]);
  if (minutes > 0) return minutes;
  const directNumber = normalizeCourseNumber(normalized);
  return directNumber ? Math.round(directNumber) : null;
};

export const normalizeCourseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const normalizeCourseStringList = (value?: string | null) => {
  if (!value?.trim()) return [];
  return value
    .split(/\n|;|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const detectCourseSourcePlatform = (sourceUrl?: string | null) => {
  const url = sourceUrl?.toLowerCase();
  if (!url) return null;
  if (url.includes("coursera.org")) return "COURSERA";
  if (url.includes("udemy.com")) return "UDEMY";
  if (url.includes("edx.org")) return "EDX";
  if (url.includes("linkedin.com")) return "LINKEDIN_LEARNING";
  return "OTHER";
};

export const resolveCourseInstructor = (input: {
  instructor?: string | null;
  sourcePlatform?: string | null;
}) => {
  const instructor = input.instructor?.trim();
  if (instructor) return instructor;
  if (input.sourcePlatform?.toUpperCase() === "COURSERA") return "Coursera";
  if (input.sourcePlatform?.toUpperCase() === "UDEMY") return "Udemy";
  if (input.sourcePlatform?.toUpperCase() === "EDX") return "edX";
  return "External Provider";
};

export const resolveCourseCurrency = (currency?: string | null) => {
  const value = currency?.trim().toUpperCase();
  if (!value) return "USD";
  return value.slice(0, 3);
};
