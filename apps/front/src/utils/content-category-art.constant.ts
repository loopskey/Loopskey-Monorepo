import type { CourseCategory } from "@/lib/graphql/base";

type TContentCategoryValue = `${CourseCategory}`;

const CONTENT_CATEGORY_ART_SLUG: Record<TContentCategoryValue, string> = {
  ACCOUNTING: "accounting",
  AI: "ai",
  BUSINESS: "business",
  CAREER: "career",
  CERTIFICATION: "certification",
  CLOUD: "cloud",
  COMMUNICATION: "communication",
  COMPLIANCE: "compliance",
  CONSTRUCTION: "construction",
  CYBERSECURITY: "cybersecurity",
  DATA: "data",
  DESIGN: "design",
  EDUCATION: "education",
  ENGINEERING: "engineering",
  FINANCE: "finance",
  GENERAL: "general",
  HEALTHCARE: "healthcare",
  HEALTH_SAFETY: "health-safety",
  HUMAN_RESOURCES: "human-resources",
  LEADERSHIP: "leadership",
  LEGAL: "legal",
  MARKETING: "marketing",
  NURSING: "nursing",
  PRODUCT_MANAGEMENT: "product-management",
  PROJECT_MANAGEMENT: "project-management",
  QUALITY: "quality",
  SALES: "sales",
  SOFTWARE_DEVELOPMENT: "software-development",
  SUPPLY_CHAIN: "supply-chain",
  SUSTAINABILITY: "sustainability",
  TECHNOLOGY: "technology",
};

const FALLBACK_CATEGORY: TContentCategoryValue = "GENERAL";

export const CONTENT_CATEGORY_ART_CLASS_NAME =
  "bg-cover bg-[position:100%_center]";

const ART_SLUG_BY_CATEGORY: ReadonlyMap<string, string> = new Map(
  Object.entries(CONTENT_CATEGORY_ART_SLUG),
);

export const getContentCategoryArtSrc = (category?: string | null) => {
  const slug =
    (category ? ART_SLUG_BY_CATEGORY.get(category) : undefined) ??
    CONTENT_CATEGORY_ART_SLUG[FALLBACK_CATEGORY];
  return `/category-art-${slug}.svg`;
};
