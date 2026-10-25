import type { TLandingHeroContentKind } from "@/types/landing-module.types";

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

export const SEARCH_DEBOUNCE_MS = 350;
