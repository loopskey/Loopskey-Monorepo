import { TCursorState, TSelectOption } from "@/types/content-module.types";
import { TLandingHeroContentKind } from "@/types/landing-module.types";
import { TSelectedRange } from "@/types/professional-dashboard.types";
import { TServiceItem } from "@/types/pages.types";
import { Role } from "@lib/graphql/generated";

import * as L from "lucide-react";

// ============== Header ==============
export const siteLinks = {
  home: "/",
  login: "/auth/professional",
  providerAuth: "/auth/provider",
  organizationAuth: "/auth/organization",

  content: "/content",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  services: "/services",

  blog: "/blog",
  careers: "/careers",
  beProfessional: "/auth/professional",
  beProvider: "/auth/provider",
  beOrganization: "/auth/organization",

  cookiePolicy: "/cookies",
  termsOfService: "/terms",
  privacyPolicy: "/privacy-policy",

  adminDashboard: "/dashboard/admin",
  providerDashboard: "/dashboard/provider",
  professionalDashboard: "/dashboard/professional",
  organizationDashboard: "/dashboard/organization",

  profile: "/dashboard/professional?tab=profile",
};

export const companyEmail = "Loopskey.dev@gmail.com";

export const socialLinks = {
  linkedin: "https://www.linkedin.com",
  x: "https://x.com",
  facebook: "https://www.facebook.com",
  youtube: "https://www.youtube.com",
};

// ================= LoginForm =================
export const getDashboardPath = (role?: Role | null) => {
  switch (role) {
    case Role.Admin:
      return siteLinks.adminDashboard;
    case Role.Provider:
      return siteLinks.providerDashboard;
    case Role.Organization:
      return siteLinks.organizationDashboard;
    case Role.Professional:
      return siteLinks.professionalDashboard;
    default:
      return siteLinks.home;
  }
};

export const getDashboardProfilePath = (role?: Role | null) => {
  switch (role) {
    case Role.Professional:
      return `${siteLinks.professionalDashboard}?tab=profile`;
    case Role.Provider:
      return `${siteLinks.providerDashboard}?tab=profile`;
    case Role.Organization:
      return `${siteLinks.organizationDashboard}?tab=profile`;
    case Role.Admin:
      return siteLinks.adminDashboard;
    default:
      return siteLinks.login;
  }
};

// ============= Content ===============
export const TAKE = 12;

export const initialCursor: TCursorState = {
  page: 1,
  history: [],
  cursor: undefined,
};

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

// =============== Landing ================
export const LANDING_HUB_TAKE = 20;

export const HERO_SEARCH_TAKE = 4;

export const HERO_CATEGORY_TAKE = 8;

export const getKindHrefPrefix = (kind: TLandingHeroContentKind) => {
  if (kind === "course") return "/courses";
  if (kind === "event") return "/events";
  if (kind === "podcast") return "/podcasts";
  return "/youtube";
};

// ============== Roadmap Landing ================
export const milestones = [
  {
    icon: L.Target,
    key: "systemsEngineering",
    status: "done",
  },
  {
    icon: L.CalendarDays,
    key: "incoseSymposium",
    status: "active",
  },
  {
    icon: L.Sparkles,
    key: "riskReliability",
    status: "upcoming",
  },
  {
    icon: L.Award,
    key: "charteredEngineer",
    status: "upcoming",
  },
] as const;

export const benefits = [
  "aiSequencing",
  "eventSlotting",
  "progressTracking",
  "adaptiveRoadmap",
] as const;

export const statusConfig = {
  done: {
    icon: L.Check,
    circleClassName: "bg-primary text-primary-foreground border-primary",
    lineClassName: "bg-primary",
  },
  active: {
    icon: L.LoaderCircle,
    circleClassName:
      "bg-background text-primary border-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.12)]",
    lineClassName: "bg-primary/50",
  },
  upcoming: {
    icon: L.Circle,
    circleClassName: "bg-background text-muted-foreground border-glass-border",
    lineClassName: "bg-glass-border",
  },
} as const;

// ============= Landing Org ===============
export const fallbackStats = [
  {
    key: "teamMembers",
    value: "1,248",
  },
  {
    key: "cpdCompliant",
    value: "94%",
  },
  {
    key: "avgGrowth",
    value: "+31%",
  },
];

export const fallbackCompliance = [
  {
    key: "compliant",
    value: 94,
  },
  {
    key: "atRisk",
    value: 18,
  },
  {
    key: "nonCompliant",
    value: 6,
  },
];

export const fallbackFeatures = [
  {
    key: "teamProgress",
    icon: L.Users2,
  },
  {
    key: "cpdCompliance",
    icon: L.ShieldCheck,
  },
  {
    key: "skillAnalytics",
    icon: L.BarChart3,
  },
  {
    key: "learningAssignments",
    icon: L.ClipboardList,
  },
];

// ============= Charts =================
export const CHART_COLORS = [
  "#2563eb",
  "#14b8a6",
  "#a855f7",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#eab308",
  "#06b6d4",
];

export const PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
export const SEARCH_DEBOUNCE_MS = 350;

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

export const visibilityItems = [
  {
    value: "PUBLIC",
    key: "public",
  },
  {
    value: "FOLLOWERS_ONLY",
    key: "followersOnly",
  },
  {
    value: "PRIVATE",
    key: "private",
  },
] as const;

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

export const priceOptions = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Free",
    value: "FREE",
  },
  {
    label: "Paid",
    value: "PAID",
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
