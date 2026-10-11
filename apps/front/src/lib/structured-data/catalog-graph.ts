import { nodeId, webPageNode } from "@/lib/structured-data/graph";
import { contentDetailPath } from "@/lib/social-card/metadata";
import { localizedUrl } from "@/lib/site/page-metadata";
import { plainText } from "@/lib/structured-data/facts";
import { siteUrl } from "@/lib/site/site-url";

import type { CatalogPageData } from "@/lib/server/catalog-reader";
import type { SocialCardKind } from "@/lib/social-card/content";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { TContentTab } from "@/types/content-module.types";
import type { JsonLdNode } from "@/lib/structured-data/json-ld";

const KIND_OF_TAB: Record<TContentTab, SocialCardKind> = {
  courses: "course",
  events: "event",
  podcasts: "podcast",
  youtube: "youtube",
};

type CatalogGraphInput = {
  path: string;
  name: string;
  locale: PublicLocale;
  page: CatalogPageData;
  description?: string | null;
};

const itemUrl = (
  kind: SocialCardKind,
  slug: string,
  locale: PublicLocale,
  available: readonly string[] | null | undefined,
) => {
  const path = contentDetailPath(kind, slug);
  return locale === "fr" && available?.includes("FR")
    ? localizedUrl(path, "fr")
    : siteUrl(path);
};

export const catalogGraph = ({
  page,
  path,
  name,
  locale,
  description,
}: CatalogGraphInput): JsonLdNode[] => {
  if (page.items.length === 0) return [];
  const kind = KIND_OF_TAB[page.tab];
  const pageUrl = localizedUrl(path, locale);
  const listId = nodeId(pageUrl, "itemlist");
  return [
    webPageNode({
      path,
      name,
      locale,
      description,
      type: "CollectionPage",
      mainEntityId: listId,
    }),
    {
      "@type": "ItemList",
      "@id": listId,
      numberOfItems: page.items.length,
      itemListElement: page.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: plainText(item.title),
        url: itemUrl(kind, item.slug, locale, item.availableLocales),
      })),
    },
  ];
};
