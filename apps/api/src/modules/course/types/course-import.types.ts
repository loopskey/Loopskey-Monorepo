import { CourseCategory, CourseLevel, CourseStatus } from "@prisma/client";

export type TCrawledCourseRow = {
  rowNumber: number;
  learnings?: string[];
  title?: string | null;
  price?: number | null;
  rating?: number | null;
  isFree?: boolean | null;
  requirements?: string[];
  currency?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  instructor?: string | null;
  level?: CourseLevel | null;
  description?: string | null;
  lastUpdatedAt?: Date | null;
  ratingCount?: number | null;
  status?: CourseStatus | null;
  professionals?: number | null;
  sourcePlatform?: string | null;
  durationMinutes?: number | null;
  rawData: Record<string, unknown>;
  externalCourseId?: string | null;
  category?: CourseCategory | null;
};

export type TCourseImportResult = {
  failed: number;
  created: number;
  updated: number;
  skipped: number;
  totalRows: number;
  errors: Array<{
    reason: string;
    rowNumber: number;
  }>;
};
