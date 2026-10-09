import { translateWithFallback } from "@/utils/function-helper";
import { humanizeEnumValue } from "@/utils/function-helper";

import type { TContentCardItem } from "@/types/content-module.types";
import type { I18nContextValue } from "@/types/providers.types";
import type { CatalogPageData } from "@/lib/server/catalog-reader";

type Translate = I18nContextValue["t"];

const DEFAULT_EVENT_TIME_ZONE = "UTC";

const formatEventDate = (
  value: string,
  timeZone: string | null | undefined,
  language: string,
) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeZone: timeZone || DEFAULT_EVENT_TIME_ZONE,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeZone: DEFAULT_EVENT_TIME_ZONE,
    }).format(date);
  }
};

const enumLabel = (t: Translate, prefix: string, value?: string | null) =>
  value
    ? translateWithFallback(
        t,
        `content.enums.${prefix}.${value}`,
        humanizeEnumValue(value),
      )
    : null;

const countLabel = (t: Translate, key: string, count?: number | null) =>
  count ? t(key, { count }) : null;

export const toCardItems = (
  page: CatalogPageData,
  t: Translate,
  language: string,
): TContentCardItem[] => {
  switch (page.tab) {
    case "courses":
      return page.items.map((course) => ({
        id: course.id,
        slug: course.slug,
        kind: "course",
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        category: enumLabel(t, "courseCategory", course.category),
        categoryCode: course.category,
        status: enumLabel(t, "courseLevel", course.level),
        rating: course.rating,
        price: course.price ?? null,
        isFree: course.isFree,
        metaPrimary: countLabel(
          t,
          "content.card.professionals",
          course.professionals,
        ),
        metaSecondary: countLabel(
          t,
          "content.card.minutes",
          course.durationMinutes,
        ),
        href: `/courses/${course.slug}`,
      }));
    case "events":
      return page.items.map((event) => ({
        id: event.id,
        slug: event.slug,
        kind: "event",
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
        category: enumLabel(t, "eventCategory", event.category),
        categoryCode: event.category,
        status: enumLabel(t, "eventType", event.type),
        rating: event.averageRating,
        price: event.price ?? null,
        isFree: event.isFree,
        metaPrimary: countLabel(t, "content.card.attendees", event.attendees),
        metaSecondary: event.startDate
          ? formatEventDate(event.startDate, event.timezone, language)
          : null,
        href: `/events/${event.slug}`,
      }));
    case "podcasts":
      return page.items.map((podcast) => ({
        id: podcast.id,
        slug: podcast.slug,
        kind: "podcast",
        title: podcast.title,
        description: podcast.description,
        imageUrl: podcast.imageUrl,
        category: enumLabel(t, "podcastCategory", podcast.category),
        categoryCode: podcast.category,
        rating: podcast.rating,
        metaPrimary: countLabel(t, "content.card.listeners", podcast.listeners),
        metaSecondary: countLabel(
          t,
          "content.card.episodes",
          podcast.episodeCount,
        ),
        href: `/podcasts/${podcast.slug}`,
      }));
    default:
      return page.items.map((channel) => ({
        id: channel.id,
        slug: channel.slug,
        kind: "youtube",
        title: channel.title,
        description: channel.description,
        imageUrl: channel.imageUrl,
        category: enumLabel(t, "youtubeCategory", channel.category),
        categoryCode: channel.category,
        rating: channel.rating,
        metaPrimary: countLabel(
          t,
          "content.card.subscribers",
          channel.subscribers,
        ),
        metaSecondary: countLabel(t, "content.card.videos", channel.videoCount),
        href: `/youtube/${channel.slug}`,
      }));
  }
};
