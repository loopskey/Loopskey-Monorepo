import { TProfessionalWishlistContent } from "@/types/hooks.types";
import { TFaqCategoryKey, TFaqItem } from "@/types/hooks.types";
import { TProfessionalWishlistItem } from "@/types/hooks.types";
import { ProviderDashboardRange } from "@/lib/graphql/generated";
import { PromotionRequestStatus } from "@/lib/graphql/generated";
import { PromotionType, Role } from "@/lib/graphql/generated";
import { DocumentNode } from "graphql";
import { print } from "graphql";

import en from "@/i18n/en.json";
import fr from "@/i18n/fr.json";

// ============== OAuth Element ==============
export const isRole = (value: string | null): value is Role =>
  Object.values(Role).includes(value as Role);

// ============== RTK Query ==============
export const documentToString = (document: string | DocumentNode): string => {
  if (typeof document === "string") return document;
  return print(document);
};

// ============== I18n ==============
export const dictionaries = { en, fr } as const;
export type Dictionary = typeof en;
export type DictValue =
  | null
  | string
  | number
  | boolean
  | DictObject
  | DictValue[];

export type DictObject = {
  [key: string]: DictValue;
};

export const getByKey = (source: unknown, key: string): unknown => {
  return key.split(".").reduce<unknown>((current, part) => {
    if (typeof current !== "object" || current === null) return undefined;
    return (current as Record<string, unknown>)[part];
  }, source);
};

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

// ============== Header =================
export const isValidHref = (href: unknown): href is string =>
  typeof href === "string" && href.trim().length > 0;

export const normalizePath = (path: string) => {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "");
};

// ============== User Menu =================
export const getInitials = (
  fullName?: string | null,
  email?: string | null,
) => {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
  }
  return email?.[0]?.toUpperCase() ?? "U";
};

// ============= Content Details ============
export const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en", { month: "short" }).format(date);

// ================ Guards ================
export const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET_KEY;
  if (!secret) throw new Error("SESSION_SECRET_KEY is not defined.");
  return new TextEncoder().encode(secret);
};

// ================= Provider Dashboard =================
export const TOTAL_STEPS = 4;

export const emptyToUndefined = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export const rangeOptions = [
  ProviderDashboardRange.Last_7Days,
  ProviderDashboardRange.Last_30Days,
  ProviderDashboardRange.Last_90Days,
  ProviderDashboardRange.ThisYear,
];

export const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

export const isValidImageSrc = (value?: string | boolean | null) => {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const src = value.trim();
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// ================= Admin Dashboard =============
export const numberValue = (value: unknown) => Number(value ?? 0);

// ================= Org Dashboard ================
export const toDateInput = (value?: string | null) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

// ================ Professional Dashboard ===============
export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const currentYear = new Date().getFullYear();

export const orUndefined = (value?: string | null) =>
  value?.trim() || undefined;

export const toTimestamp = (value?: string | Date | null): number => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const normalizeText = (value: unknown): string =>
  String(value ?? "").toLowerCase();

export const getContentPrice = (item: TProfessionalWishlistItem): number => {
  const content = item.content;
  if (content?.isFree) return 0;
  const price = Number(content?.price ?? 0);
  return Number.isFinite(price) ? price : 0;
};

export const getContentTitle = (item: TProfessionalWishlistItem): string =>
  normalizeText(item.content?.title);

export const getContentRating = (item: TProfessionalWishlistItem): number => {
  const rating = Number(item.content?.rating ?? 0);
  return Number.isFinite(rating) ? rating : 0;
};

export const isRatedContent = (
  rating: TProfessionalWishlistContent["rating"],
): rating is number => {
  return typeof rating === "number" && Number.isFinite(rating);
};

export const filterSearchableValues = (
  item: TProfessionalWishlistItem,
): Array<string | number> => {
  const content = item.content;
  return [
    content?.title,
    item.contentId,
    item.contentType,
    content?.category,
    content?.description,
    content?.providerName,
  ].filter((value): value is string => {
    return typeof value === "string" || typeof value === "number";
  });
};

// =============== Provider Dashboard ===============
type TranslateFn = (key: string) => string;

export const humanizeEnumValue = (value: string): string => {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const translateWithFallback = (
  t: TranslateFn,
  key: string,
  fallback: string,
): string => {
  const translated = t(key);
  if (!translated || translated.trim().length === 0 || translated === key)
    return fallback;
  return translated;
};

export const getPromotionTypeLabel = (
  t: TranslateFn,
  value: PromotionType,
): string => {
  return translateWithFallback(
    t,
    `providerDashboard.promotions.types.${value}`,
    humanizeEnumValue(value),
  );
};

export const getPromotionStatusLabel = (
  t: TranslateFn,
  value: PromotionRequestStatus,
): string => {
  return translateWithFallback(
    t,
    `providerDashboard.promotions.statuses.${value}`,
    humanizeEnumValue(value),
  );
};

// =============== Hook FAQ Page ===============
export const faqCategories = [
  "AI",
  "ALL",
  "CPD",
  "SECURITY",
  "PLATFORM",
  "PROVIDERS",
  "ORGANIZATIONS",
  "CERTIFICATIONS",
] satisfies TFaqCategoryKey[];

export const isFaqCategory = (
  value: unknown,
): value is Exclude<TFaqCategoryKey, "ALL"> => {
  return (
    value === "AI" ||
    value === "CPD" ||
    value === "PLATFORM" ||
    value === "SECURITY" ||
    value === "PROVIDERS" ||
    value === "ORGANIZATIONS" ||
    value === "CERTIFICATIONS"
  );
};

export const isFaqItem = (value: unknown): value is TFaqItem => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<TFaqItem>;
  return (
    typeof item.id === "string" &&
    isFaqCategory(item.category) &&
    typeof item.question === "string" &&
    typeof item.answer === "string"
  );
};

export const isFaqItemArray = (value: unknown): value is TFaqItem[] => {
  return Array.isArray(value) && value.every(isFaqItem);
};

// =============== Landinig Org =================
export const formatNumber = (value?: number | null) =>
  new Intl.NumberFormat("en-US").format(Number(value ?? 0));

export const formatPercent = (value?: number | null) =>
  `${Math.round(Number(value ?? 0))}%`;

// ================ Calendar Dialog ================
export const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

// =========== CPD ===============
export const formatDeadline = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : "—";
