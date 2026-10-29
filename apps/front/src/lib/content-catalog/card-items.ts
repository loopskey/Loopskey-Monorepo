import { translateWithFallback } from "@/utils/function-helper";
import { humanizeEnumValue } from "@/utils/function-helper";
import { localizePath } from "@/lib/i18n/locale";

import type { TContentCardItem } from "@/types/content-module.types";
import type { TContentCardKind } from "@/types/content-module.types";
import type { I18nContextValue } from "@/types/providers.types";
import type { CatalogPageData } from "@/lib/server/catalog-reader";

type Translate = I18nContextValue["t"];

const DEFAULT_EVENT_TIME_ZONE = "UTC";

const eventDateParts = (
  value: string,
  timeZone: string | null | undefined,
  language: string,
) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const format = (zone: string) => {
    const parts = new Intl.DateTimeFormat(language, {
      day: "numeric",
      month: "short",
      timeZone: zone,
    }).formatToParts(date);
    const part = (type: string) =>
      parts.find((entry) => entry.type === type)?.value ?? "";
    return { day: part("day"), month: part("month").replace(".", "") };
  };
  try {
    return format(timeZone || DEFAULT_EVENT_TIME_ZONE);
  } catch {
    return format(DEFAULT_EVENT_TIME_ZONE);
  }
};

const detailHref = (
  path: string,
  language: string,
  available: readonly string[] | null | undefined,
) =>
  language === "fr" && available?.includes("FR")
    ? localizePath(path, "fr")
    : path;

const localeFields = (
  language: string,
  contentLanguage: string | null | undefined,
) => ({
  contentLang: contentLanguage ? contentLanguage.toLowerCase() : null,
  originalLanguage: language === "fr" && contentLanguage !== "FR",
});

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

const bylineOf = (t: Translate, name?: string | null) =>
  name?.trim() ? t("content.card.byline", { name: name.trim() }) : null;

const ratingCountOf = (language: string, count?: number | null) =>
  count ? new Intl.NumberFormat(language).format(count) : null;

const CATEGORY_ENUM_BY_KIND: Record<TContentCardKind, string> = {
  course: "courseCategory",
  event: "eventCategory",
  podcast: "podcastCategory",
  youtube: "youtubeCategory",
};

export const cardCategoryLabel = (
  t: Translate,
  kind: TContentCardKind,
  value?: string | null,
) => enumLabel(t, CATEGORY_ENUM_BY_KIND[kind], value);

type CatalogCourse = Extract<
  CatalogPageData,
  { tab: "courses" }
>["items"][number];

export type CardCourse = Omit<
  CatalogCourse,
  "availableLocales" | "contentLanguage"
> &
  Partial<Pick<CatalogCourse, "availableLocales" | "contentLanguage">>;

export const toCourseCardItem = (
  course: CardCourse,
  t: Translate,
  language: string,
): TContentCardItem => ({
  id: course.id,
  slug: course.slug,
  kind: "course",
  title: course.title,
  byline: bylineOf(t, course.instructor),
  category: enumLabel(t, "courseCategory", course.category),
  categoryKey: course.category,
  status: enumLabel(t, "courseLevel", course.level),
  levelKey: course.level,
  rating: course.rating,
  ratingCount: ratingCountOf(language, course.ratingCount),
  metaPrimary: countLabel(
    t,
    "content.card.professionals",
    course.professionals,
  ),
  metaSecondary: countLabel(t, "content.card.minutes", course.durationMinutes),
  href: detailHref(
    `/courses/${course.slug}`,
    language,
    course.availableLocales,
  ),
  ...localeFields(language, course.contentLanguage),
});

export const toCardItems = (
  page: CatalogPageData,
  t: Translate,
  language: string,
): TContentCardItem[] => {
  switch (page.tab) {
    case "courses":
      return page.items.map((course) => toCourseCardItem(course, t, language));
    case "events":
      return page.items.map((event) => ({
        id: event.id,
        slug: event.slug,
        kind: "event",
        title: event.title,
        byline: bylineOf(t, event.organizer || event.speaker),
        category: enumLabel(t, "eventCategory", event.category),
        categoryKey: event.category,
        status: enumLabel(t, "eventType", event.type),
        rating: event.averageRating,
        ratingCount: ratingCountOf(language, event.ratingCount),
        dateBadge: event.startDate
          ? eventDateParts(event.startDate, event.timezone, language)
          : null,
        metaPrimary: countLabel(t, "content.card.attendees", event.attendees),
        metaSecondary: event.location?.trim() || null,
        href: detailHref(
          `/events/${event.slug}`,
          language,
          event.availableLocales,
        ),
        ...localeFields(language, event.contentLanguage),
      }));
    case "podcasts":
      return page.items.map((podcast) => ({
        id: podcast.id,
        slug: podcast.slug,
        kind: "podcast",
        title: podcast.title,
        byline: bylineOf(t, podcast.host),
        category: enumLabel(t, "podcastCategory", podcast.category),
        categoryKey: podcast.category,
        rating: podcast.rating,
        ratingCount: ratingCountOf(language, podcast.ratingCount),
        metaPrimary: countLabel(t, "content.card.listeners", podcast.listeners),
        metaSecondary: countLabel(
          t,
          "content.card.episodes",
          podcast.episodeCount,
        ),
        href: detailHref(
          `/podcasts/${podcast.slug}`,
          language,
          podcast.availableLocales,
        ),
        ...localeFields(language, podcast.contentLanguage),
      }));
    default:
      return page.items.map((channel) => ({
        id: channel.id,
        slug: channel.slug,
        kind: "youtube",
        title: channel.title,
        byline: bylineOf(t, channel.provider),
        category: enumLabel(t, "youtubeCategory", channel.category),
        categoryKey: channel.category,
        rating: channel.rating,
        ratingCount: ratingCountOf(language, channel.ratingCount),
        metaPrimary: countLabel(
          t,
          "content.card.subscribers",
          channel.subscribers,
        ),
        metaSecondary: countLabel(t, "content.card.videos", channel.videoCount),
        href: detailHref(
          `/youtube/${channel.slug}`,
          language,
          channel.availableLocales,
        ),
        ...localeFields(language, channel.contentLanguage),
      }));
  }
};
