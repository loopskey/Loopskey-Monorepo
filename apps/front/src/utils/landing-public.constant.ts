import type { TLandingHeroContentKind } from "@/types/landing-module.types";
import * as L from "lucide-react";

export const LANDING_HUB_TAKE = 20;

export const HERO_SEARCH_TAKE = 12;

export const HERO_SEARCH_MIN_LENGTH = 3;

export const HERO_CATEGORY_TAKE = 8;

export const getKindHrefPrefix = (kind: TLandingHeroContentKind) => {
  if (kind === "course") return "/courses";
  if (kind === "event") return "/events";
  if (kind === "podcast") return "/podcasts";
  return "/youtube";
};

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

export const SEARCH_DEBOUNCE_MS = 350;

export const HERO_SPLIT_STAGGER_MS = 25;

export const HERO_SPLIT_DURATION_S = 0.9;
