import { contentDetailPath } from "@/lib/content-catalog/detail-path";
import { publicPagePath } from "@/lib/content-catalog/public-path";
import { loadDictionary } from "@/i18n/dictionaries";
import { plainText } from "@/lib/structured-data/facts";
import { tabHref } from "@/lib/content-catalog/catalog-href";

import type { SocialCardKind } from "@/lib/social-card/content";
import type { EditorialKind } from "@/lib/content-catalog/public-path";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { TContentTab } from "@/types/content-module.types";

export type TrailItem = {
  name: string;
  path: string;
};

export type Trail = {
  label: string;
  items: TrailItem[];
};

const TAB_OF_KIND: Record<SocialCardKind, TContentTab> = {
  course: "courses",
  event: "events",
  podcast: "podcasts",
  youtube: "youtube",
};

type DetailTrailInput = {
  kind: SocialCardKind;
  slug: string;
  title: string;
  locale: PublicLocale;
};

export const detailTrail = async ({
  kind,
  slug,
  title,
  locale,
}: DetailTrailInput): Promise<Trail> => {
  const dictionary = await loadDictionary(locale);
  const tab = TAB_OF_KIND[kind];
  return {
    label: dictionary.contentDetails.common.breadcrumb,
    items: [
      { name: dictionary.navigation.home, path: "/" },
      { name: dictionary.content.tabs[tab], path: tabHref(tab) },
      { name: plainText(title) ?? title, path: contentDetailPath(kind, slug) },
    ],
  };
};

type EditorialTrailInput = {
  kind: EditorialKind;
  slug: string;
  title: string;
  locale: PublicLocale;
};

export const editorialTrail = async ({
  kind,
  slug,
  title,
  locale,
}: EditorialTrailInput): Promise<Trail> => {
  const dictionary = await loadDictionary(locale);
  return {
    label: dictionary.contentDetails.common.breadcrumb,
    items: [
      { name: dictionary.navigation.home, path: "/" },
      { name: plainText(title) ?? title, path: publicPagePath(kind, slug) },
    ],
  };
};
