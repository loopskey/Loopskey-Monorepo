import { YouTubeCategory } from "@prisma/client";

const key = (value?: string | null) =>
  value
    ?.trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_") ?? "";

export const normalizeYouTubeCategory = (
  value?: string | null,
): YouTubeCategory => {
  const normalized = key(value);
  if (!normalized) return YouTubeCategory.OTHER;
  if (normalized in YouTubeCategory) return normalized as YouTubeCategory;
  const map: Record<string, YouTubeCategory> = {
    TECH: YouTubeCategory.TECHNOLOGY,
    SOFTWARE: YouTubeCategory.TECHNOLOGY,
    PROGRAMMING: YouTubeCategory.TECHNOLOGY,
    CODING: YouTubeCategory.TECHNOLOGY,
    MACHINE_LEARNING: YouTubeCategory.AI,
    ANALYTICS: YouTubeCategory.DATA,
    MANAGEMENT: YouTubeCategory.BUSINESS,
    ENTREPRENEURSHIP: YouTubeCategory.BUSINESS,
    ACCOUNTING: YouTubeCategory.FINANCE,
    INVESTING: YouTubeCategory.FINANCE,
    SALES: YouTubeCategory.MARKETING,
    JOBS: YouTubeCategory.CAREER,
    LAW: YouTubeCategory.COMPLIANCE,
    MEDICINE: YouTubeCategory.HEALTHCARE,
  };
  return map[normalized] ?? YouTubeCategory.OTHER;
};
