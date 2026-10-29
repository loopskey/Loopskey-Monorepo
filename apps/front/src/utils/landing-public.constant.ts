import type { TLandingHeroContentKind } from "@/types/landing-module.types";

export const LANDING_HUB_ROW_SIZE = 4;

export const LANDING_HUB_POOL_SIZE = 8;

export const LANDING_HUB_VIEW_ALL_HREF = "/content";

export const LANDING_HUB_LIST_CLASS_NAME =
  "-mx-4 -my-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 py-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 xl:mx-0 xl:grid xl:snap-none xl:grid-cols-4 xl:gap-x-8 xl:overflow-visible xl:px-0";

export const LANDING_HUB_ITEM_CLASS_NAME =
  "flex w-[17.5rem] shrink-0 snap-start sm:w-[19rem] xl:w-auto";

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
