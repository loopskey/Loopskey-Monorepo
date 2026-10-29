export {
  HERO_SEARCH_TAKE,
  HERO_SEARCH_MIN_LENGTH,
  HERO_CATEGORY_TAKE,
  getKindHrefPrefix,
  SEARCH_DEBOUNCE_MS,
} from "./landing-public.constant";

import { TSelectedRange } from "@/types/professional-dashboard.types";
import { TSelectOption } from "@/types/content-module.types";
import { TServiceItem } from "@/types/pages.types";

import * as L from "lucide-react";

export * from "@/utils/site-navigation";

export const PASSWORD_STRENGTH_MESSAGE =
  "Password must be at least 8 characters and include both letters and numbers.";

// ============= Content ===============
export const enumOptions = <T extends Record<string, string>>(
  enumObject: T,
  labelPrefix: string,
  t: (
    key: string,
    params?: Record<string, string | number>,
    fallback?: string,
  ) => string,
): TSelectOption[] => {
  return Object.values(enumObject).map((value) => ({
    value,
    label: t(`${labelPrefix}.${value}`, {}, value.replace(/_/g, " ")),
  }));
};

// ============= Charts =================
export const CHART_COLORS = [
  "#010080",
  "#31C2F9",
  "#F17815",
  "#15803D",
  "#3A5EB2",
  "#007EB2",
  "#A63E00",
  "#69BA7C",
];

export const PAGE_SIZE = 10;

export const DASHBOARD_MENU_BUTTON_ID = "dashboard-menu-button";

export const DEFAULT_PAGE = 1;

export const FALLBACK_CURRENCY = "USD";

// ============= Professional Calendar tab ============
export const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

export const getDefaultRange = (): TSelectedRange => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
};

export const contentTypeIcon = {
  COURSE: L.BookOpen,
  EVENT: L.CalendarDays,
  PODCAST: L.Podcast,
  YOUTUBE: L.Youtube,
};

export const contentTypeOptions = [
  {
    label: "All",
    value: "ALL",
    icon: L.LayoutGrid,
  },
  {
    label: "Courses",
    value: "COURSE",
    icon: L.BookOpen,
  },
  {
    label: "Events",
    value: "EVENT",
    icon: L.CalendarDays,
  },
  {
    label: "Podcasts",
    value: "PODCAST",
    icon: L.Podcast,
  },
  {
    label: "YouTube",
    value: "YOUTUBE",
    icon: L.Youtube,
  },
] as const;

export const sortOptions = [
  {
    label: "Newest",
    value: "NEWEST",
  },
  {
    label: "Oldest",
    value: "OLDEST",
  },
  {
    label: "Title A-Z",
    value: "TITLE_ASC",
  },
  {
    label: "Title Z-A",
    value: "TITLE_DESC",
  },
  {
    label: "Rating",
    value: "RATING_DESC",
  },
  {
    label: "Price low to high",
    value: "PRICE_ASC",
  },
  {
    label: "Price high to low",
    value: "PRICE_DESC",
  },
] as const;

// ================ Org Dashboard ===============
export const normalizeText = (value: unknown) => String(value ?? "").trim();

export const ALL_VALUE = "ALL";

export const ALL_DEPARTMENTS = "ALL";

export const rangeOrgReportOptions = [
  { value: "CURRENT_YEAR", label: "Current year" },
  { value: "LAST_QUARTER", label: "Last quarter" },
  { value: "CUSTOM", label: "Custom range" },
];

// ============= Service Page =================
export const services: TServiceItem[] = [
  {
    key: "discovery",
    icon: L.Sparkles,
    image: "/service-discovery.jpg",
    direction: "left",
  },
  {
    key: "roadmaps",
    icon: L.Map,
    image: "/service-roadmap.jpg",
    direction: "right",
  },
  {
    key: "cpd",
    icon: L.Award,
    image: "/service-cpd.jpg",
    direction: "left",
  },
  {
    key: "workforce",
    icon: L.Building2,
    image: "/service-workforce.jpg",
    direction: "right",
  },
  {
    key: "providers",
    icon: L.Megaphone,
    image: "/service-providers.jpg",
    direction: "left",
  },
];

export const valueCards = [
  {
    key: "personalized",
    icon: L.Target,
  },
  {
    key: "compliance",
    icon: L.ShieldCheck,
  },
  {
    key: "automation",
    icon: L.CalendarCheck2,
  },
  {
    key: "ecosystem",
    icon: L.UsersRound,
  },
];

// =================== About Page ====================
export const values = [
  {
    key: "intelligence",
    icon: L.Sparkles,
    direction: "left",
  },
  {
    key: "learner",
    icon: L.Heart,
    direction: "right",
  },
  {
    key: "trust",
    icon: L.ShieldCheck,
    direction: "left",
  },
  {
    key: "growth",
    icon: L.Compass,
    direction: "right",
  },
] as const;

export const team = [
  {
    key: "olu",
    initials: "OA",
  },
  {
    key: "sara",
    initials: "SL",
  },
  {
    key: "marcus",
    initials: "MR",
  },
  {
    key: "priya",
    initials: "PS",
  },
] as const;

export const timeline = [
  {
    key: "idea",
    year: "2022",
  },
  {
    key: "roadmap",
    year: "2023",
  },
  {
    key: "enterprise",
    year: "2024",
  },
  {
    key: "global",
    year: "2025",
  },
] as const;

export const trustItems = [
  {
    key: "security",
    icon: L.ShieldCheck,
  },
  {
    key: "community",
    icon: L.Users,
  },
  {
    key: "ai",
    icon: L.Sparkles,
  },
] as const;

export const missionVision = [
  {
    key: "mission",
    icon: L.Target,
  },
  {
    key: "vision",
    icon: L.Sparkles,
  },
] as const;

// ================ FAQ Page =================
export const defaultOpenItemId = "cpd-tracking";

// ============ Native Picker Inputs ============
export const NATIVE_PICKER_TYPES = [
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
] as const;

// ============== Hero Split Text Animation ==============
