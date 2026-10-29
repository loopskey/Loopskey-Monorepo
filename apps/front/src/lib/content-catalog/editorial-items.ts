import { contentDetailPath } from "@/lib/content-catalog/detail-path";
import { humanizeEnumValue } from "@/utils/function-helper";

import type { TContentCardItem } from "@/types/content-module.types";
import type { ContentKind } from "@/lib/content-catalog/detail-path";
import type { Dictionary } from "@/i18n/dictionaries";

export type EditorialItem = {
  kind: string;
  slug: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  category?: string | null;
};

const CATEGORY_ENUM: Record<ContentKind, string> = {
  course: "courseCategory",
  event: "eventCategory",
  podcast: "podcastCategory",
  youtube: "youtubeCategory",
};

const KIND_OF: Record<string, ContentKind> = {
  COURSE: "course",
  EVENT: "event",
  PODCAST: "podcast",
  YOUTUBE: "youtube",
};

const categoryLabel = (
  dictionary: Dictionary,
  kind: ContentKind,
  code: string,
) => {
  const labels = (
    dictionary.content.enums as unknown as Record<
      string,
      Record<string, string> | undefined
    >
  )[CATEGORY_ENUM[kind]];
  return labels?.[code] ?? humanizeEnumValue(code);
};

export const toEditorialCardItems = (
  items: readonly EditorialItem[],
  dictionary: Dictionary,
): TContentCardItem[] =>
  items.flatMap((item) => {
    const kind = KIND_OF[item.kind];
    if (!kind) return [];
    return [
      {
        id: item.slug,
        slug: item.slug,
        kind,
        href: contentDetailPath(kind, item.slug),
        title: item.title,
        category: item.category
          ? categoryLabel(dictionary, kind, item.category)
          : null,
        categoryKey: item.category ?? null,
      },
    ];
  });
