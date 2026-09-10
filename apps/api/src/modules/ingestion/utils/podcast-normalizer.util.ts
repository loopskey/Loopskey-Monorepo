import { PodcastCategory } from "@prisma/client";

const key = (value?: string | null) =>
  value
    ?.trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_") ?? "";

export const normalizePodcastCategory = (
  value?: string | null,
): PodcastCategory => {
  const normalized = key(value);
  if (!normalized) return PodcastCategory.OTHER;
  if (normalized in PodcastCategory) return normalized as PodcastCategory;
  const map: Record<string, PodcastCategory> = {
    TECH: PodcastCategory.TECHNOLOGY,
    SOFTWARE: PodcastCategory.TECHNOLOGY,
    PROGRAMMING: PodcastCategory.TECHNOLOGY,
    MACHINE_LEARNING: PodcastCategory.AI,
    ANALYTICS: PodcastCategory.DATA,
    MANAGEMENT: PodcastCategory.BUSINESS,
    ENTREPRENEURSHIP: PodcastCategory.BUSINESS,
    STARTUP: PodcastCategory.BUSINESS,
    ACCOUNTING: PodcastCategory.FINANCE,
    INVESTING: PodcastCategory.FINANCE,
    SALES: PodcastCategory.MARKETING,
    HR: PodcastCategory.LEADERSHIP,
    JOBS: PodcastCategory.CAREER,
    LAW: PodcastCategory.COMPLIANCE,
    MEDICINE: PodcastCategory.HEALTHCARE,
  };
  return map[normalized] ?? PodcastCategory.OTHER;
};
