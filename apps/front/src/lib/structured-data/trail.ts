import { contentDetailPath } from "@/lib/social-card/metadata";
import { loadDictionary } from "@/i18n/dictionaries";
import { plainText } from "@/lib/structured-data/facts";
import { tabHref } from "@/lib/content-catalog/catalog-href";

import type { SocialCardKind } from "@/lib/social-card/content";
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
