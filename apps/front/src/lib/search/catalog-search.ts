import { LandingCatalogSearchDocument } from "@/lib/graphql/operations/landing";
import { executeGraphqlRequest } from "@/lib/graphql/request";

import type { LandingCatalogSearchQuery } from "@/lib/graphql/operations/landing";
import type { TContentCardKind } from "@/types/content-module.types";
import type { I18nContextValue } from "@/types/providers.types";

type Translate = I18nContextValue["t"];

export type THeaderSearchItem = {
  id: string;
  href: string;
  title: string;
  meta: string;
  kind: TContentCardKind;
};

type THit = LandingCatalogSearchQuery["landingCatalogSearch"][number];

const KIND_BY_CONTENT_TYPE: Record<string, TContentCardKind> = {
  COURSE: "course",
  EVENT: "event",
  PODCAST: "podcast",
  YOUTUBE: "youtube",
};

const PATH_BY_KIND: Record<TContentCardKind, string> = {
  course: "/courses",
  event: "/events",
  podcast: "/podcasts",
  youtube: "/youtube",
};

const detailOf = (t: Translate, kind: TContentCardKind, hit: THit) => {
  if (kind === "course" && hit.durationMinutes)
    return t("navigation.search.meta.minutes", { count: hit.durationMinutes });
  if (kind === "event" && hit.startDate)
    return new Date(hit.startDate).toLocaleDateString();
  if (kind === "podcast" && hit.episodeCount)
    return t("navigation.search.meta.episodes", { count: hit.episodeCount });
  if (kind === "youtube" && hit.videoCount)
    return t("navigation.search.meta.videos", { count: hit.videoCount });
  return null;
};

const toItem = (t: Translate, hit: THit): THeaderSearchItem | null => {
  const kind = KIND_BY_CONTENT_TYPE[hit.contentType];
  if (!kind) return null;

  return {
    kind,
    id: `${kind}-${hit.id}`,
    title: hit.title,
    href: `${PATH_BY_KIND[kind]}/${hit.slug}`,
    meta: [t(`navigation.search.kinds.${kind}`), detailOf(t, kind, hit)]
      .filter(Boolean)
      .join(" · "),
  };
};

export const searchCatalog = async (
  t: Translate,
  search: string,
  take: number,
  signal: AbortSignal,
): Promise<THeaderSearchItem[]> => {
  const result = await executeGraphqlRequest(
    {
      document: LandingCatalogSearchDocument,
      variables: { input: { search, take } },
    },
    signal,
  );
  if ("error" in result) throw new Error(result.error.message);

  const { landingCatalogSearch } = result.data as LandingCatalogSearchQuery;
  return landingCatalogSearch.flatMap((hit) => toItem(t, hit) ?? []);
};
