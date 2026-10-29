import type { CourseCategory } from "@/lib/graphql/base";
import type { StaticImageData } from "next/image";

import accountingArt from "@/assets/category-art/accounting.svg";
import aiArt from "@/assets/category-art/ai.svg";
import businessArt from "@/assets/category-art/business.svg";
import careerArt from "@/assets/category-art/career.svg";
import certificationArt from "@/assets/category-art/certification.svg";
import cloudArt from "@/assets/category-art/cloud.svg";
import communicationArt from "@/assets/category-art/communication.svg";
import complianceArt from "@/assets/category-art/compliance.svg";
import constructionArt from "@/assets/category-art/construction.svg";
import cybersecurityArt from "@/assets/category-art/cybersecurity.svg";
import dataArt from "@/assets/category-art/data.svg";
import designArt from "@/assets/category-art/design.svg";
import educationArt from "@/assets/category-art/education.svg";
import engineeringArt from "@/assets/category-art/engineering.svg";
import financeArt from "@/assets/category-art/finance.svg";
import generalArt from "@/assets/category-art/general.svg";
import healthcareArt from "@/assets/category-art/healthcare.svg";
import healthSafetyArt from "@/assets/category-art/health-safety.svg";
import humanResourcesArt from "@/assets/category-art/human-resources.svg";
import leadershipArt from "@/assets/category-art/leadership.svg";
import legalArt from "@/assets/category-art/legal.svg";
import marketingArt from "@/assets/category-art/marketing.svg";
import nursingArt from "@/assets/category-art/nursing.svg";
import productManagementArt from "@/assets/category-art/product-management.svg";
import projectManagementArt from "@/assets/category-art/project-management.svg";
import qualityArt from "@/assets/category-art/quality.svg";
import salesArt from "@/assets/category-art/sales.svg";
import softwareDevelopmentArt from "@/assets/category-art/software-development.svg";
import supplyChainArt from "@/assets/category-art/supply-chain.svg";
import sustainabilityArt from "@/assets/category-art/sustainability.svg";
import technologyArt from "@/assets/category-art/technology.svg";

type TContentCategoryValue = `${CourseCategory}`;

// Imported, not served from public/, so each cover gets a content-hashed URL
// and an edited SVG can never be shadowed by a browser-cached old copy.
const CONTENT_CATEGORY_ART: Record<TContentCategoryValue, StaticImageData> = {
  ACCOUNTING: accountingArt,
  AI: aiArt,
  BUSINESS: businessArt,
  CAREER: careerArt,
  CERTIFICATION: certificationArt,
  CLOUD: cloudArt,
  COMMUNICATION: communicationArt,
  COMPLIANCE: complianceArt,
  CONSTRUCTION: constructionArt,
  CYBERSECURITY: cybersecurityArt,
  DATA: dataArt,
  DESIGN: designArt,
  EDUCATION: educationArt,
  ENGINEERING: engineeringArt,
  FINANCE: financeArt,
  GENERAL: generalArt,
  HEALTHCARE: healthcareArt,
  HEALTH_SAFETY: healthSafetyArt,
  HUMAN_RESOURCES: humanResourcesArt,
  LEADERSHIP: leadershipArt,
  LEGAL: legalArt,
  MARKETING: marketingArt,
  NURSING: nursingArt,
  PRODUCT_MANAGEMENT: productManagementArt,
  PROJECT_MANAGEMENT: projectManagementArt,
  QUALITY: qualityArt,
  SALES: salesArt,
  SOFTWARE_DEVELOPMENT: softwareDevelopmentArt,
  SUPPLY_CHAIN: supplyChainArt,
  SUSTAINABILITY: sustainabilityArt,
  TECHNOLOGY: technologyArt,
};

const FALLBACK_CATEGORY: TContentCategoryValue = "GENERAL";

export const CONTENT_CATEGORY_ART_CLASS_NAME =
  "bg-cover bg-[position:100%_center]";

const ART_BY_CATEGORY: ReadonlyMap<string, StaticImageData> = new Map(
  Object.entries(CONTENT_CATEGORY_ART),
);

export const getContentCategoryArtSrc = (category?: string | null) =>
  (
    (category ? ART_BY_CATEGORY.get(category) : undefined) ??
    CONTENT_CATEGORY_ART[FALLBACK_CATEGORY]
  ).src;
