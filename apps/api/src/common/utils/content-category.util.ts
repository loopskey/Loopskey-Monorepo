import { CourseCategory } from "@prisma/client";

const CATEGORY_VALUES: ReadonlySet<string> = new Set(
  Object.values(CourseCategory),
);

const CATEGORY_ALIASES: Record<string, CourseCategory> = {
  CPD: CourseCategory.CERTIFICATION,
  CPD_CERTIFICATION: CourseCategory.CERTIFICATION,
  CERTIFICATIONS: CourseCategory.CERTIFICATION,
  CERTIFICATE: CourseCategory.CERTIFICATION,
  OTHER: CourseCategory.GENERAL,
  MISC: CourseCategory.GENERAL,
  MISCELLANEOUS: CourseCategory.GENERAL,
  TECH: CourseCategory.TECHNOLOGY,
  IT: CourseCategory.TECHNOLOGY,
  INFORMATION_TECHNOLOGY: CourseCategory.TECHNOLOGY,
  COMPUTER_SCIENCE: CourseCategory.TECHNOLOGY,
  SOFTWARE: CourseCategory.SOFTWARE_DEVELOPMENT,
  PROGRAMMING: CourseCategory.SOFTWARE_DEVELOPMENT,
  CODING: CourseCategory.SOFTWARE_DEVELOPMENT,
  SOFTWARE_ENGINEERING: CourseCategory.SOFTWARE_DEVELOPMENT,
  ML: CourseCategory.AI,
  MACHINE_LEARNING: CourseCategory.AI,
  ARTIFICIAL_INTELLIGENCE: CourseCategory.AI,
  AI_MACHINE_LEARNING: CourseCategory.AI,
  ANALYTICS: CourseCategory.DATA,
  DATA_ANALYTICS: CourseCategory.DATA,
  DATA_SCIENCE: CourseCategory.DATA,
  CLOUD_COMPUTING: CourseCategory.CLOUD,
  SECURITY: CourseCategory.CYBERSECURITY,
  CYBER_SECURITY: CourseCategory.CYBERSECURITY,
  INFORMATION_SECURITY: CourseCategory.CYBERSECURITY,
  MANAGEMENT: CourseCategory.BUSINESS,
  ENTREPRENEURSHIP: CourseCategory.BUSINESS,
  STARTUP: CourseCategory.BUSINESS,
  ACCOUNTANCY: CourseCategory.ACCOUNTING,
  BOOKKEEPING: CourseCategory.ACCOUNTING,
  INVESTING: CourseCategory.FINANCE,
  BANKING: CourseCategory.FINANCE,
  HR: CourseCategory.HUMAN_RESOURCES,
  HUMAN_RESOURCE: CourseCategory.HUMAN_RESOURCES,
  LAW: CourseCategory.LEGAL,
  MEDICAL: CourseCategory.HEALTHCARE,
  MEDICINE: CourseCategory.HEALTHCARE,
  NURSING_CARE: CourseCategory.NURSING,
  HEALTH_AND_SAFETY: CourseCategory.HEALTH_SAFETY,
  OHS: CourseCategory.HEALTH_SAFETY,
  CIVIL: CourseCategory.CONSTRUCTION,
  CIVIL_CONSTRUCTION: CourseCategory.CONSTRUCTION,
  PM: CourseCategory.PROJECT_MANAGEMENT,
  PRODUCT: CourseCategory.PRODUCT_MANAGEMENT,
  QUALITY_MANAGEMENT: CourseCategory.QUALITY,
  QA: CourseCategory.QUALITY,
  LOGISTICS: CourseCategory.SUPPLY_CHAIN,
  ESG: CourseCategory.SUSTAINABILITY,
  COMMUNICATIONS: CourseCategory.COMMUNICATION,
  CAREER_DEVELOPMENT: CourseCategory.CAREER,
  GRAPHIC_DESIGN: CourseCategory.DESIGN,
};

const toCategoryKey = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeContentCategory = (
  value?: string | null,
): CourseCategory => {
  const key = value ? toCategoryKey(value) : "";
  if (!key) return CourseCategory.GENERAL;
  if (CATEGORY_VALUES.has(key)) return key as CourseCategory;
  return CATEGORY_ALIASES[key] ?? CourseCategory.GENERAL;
};
