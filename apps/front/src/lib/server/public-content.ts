import { YouTubeChannelBySlugDocument } from "@/lib/graphql/operations/youtube";
import { PodcastEpisodesDocument } from "@/lib/graphql/operations/podcast";
import { PodcastBySlugDocument } from "@/lib/graphql/operations/podcast";
import { YouTubeVideosDocument } from "@/lib/graphql/operations/youtube";
import { CourseBySlugDocument } from "@/lib/graphql/operations/course";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { executeServerGraphql } from "@/lib/server/graphql-server";
import { EventBySlugDocument } from "@/lib/graphql/operations/event";
import { toApiLanguage } from "@/lib/i18n/locale";
import { cache } from "react";

import type { YouTubeChannelBySlugQuery } from "@/lib/graphql/operations/youtube";
import type { PodcastEpisodesQuery } from "@/lib/graphql/operations/podcast";
import type { PodcastBySlugQuery } from "@/lib/graphql/operations/podcast";
import type { YouTubeVideosQuery } from "@/lib/graphql/operations/youtube";
import type { CourseBySlugQuery } from "@/lib/graphql/operations/course";
import type { EventBySlugQuery } from "@/lib/graphql/operations/event";
import type { PublicLocale } from "@/lib/i18n/locale";

export type PublicCourse = NonNullable<CourseBySlugQuery["courseBySlug"]>;
export type PublicEvent = NonNullable<EventBySlugQuery["eventBySlug"]>;
export type PublicPodcast = NonNullable<PodcastBySlugQuery["podcastBySlug"]>;
export type PublicPodcastEpisode =
  PodcastEpisodesQuery["podcastEpisodes"][number];
export type PublicYouTubeChannel = NonNullable<
  YouTubeChannelBySlugQuery["youtubeChannelBySlug"]
>;
export type PublicYouTubeVideo = YouTubeVideosQuery["youtubeVideos"][number];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 200;
const PUBLISHED_STATUS = "PUBLISHED";

type Settled<T> =
  | { ok: true; value: T }
  | { ok: false; error: UpstreamFailureError };

const settle = async <T>(read: () => Promise<T>): Promise<Settled<T>> => {
  try {
    return { ok: true, value: await read() };
  } catch (error) {
    if (error instanceof UpstreamFailureError) return { ok: false, error };
    throw error;
  }
};

const unwrap = <T>(settled: Settled<T>): T => {
  if (!settled.ok) throw settled.error;
  return settled.value;
};

const isValidSlug = (slug: string) =>
  slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug);

const isPublished = (value: Record<string, unknown>) =>
  !("status" in value) || value.status === PUBLISHED_STATUS;

type DetailRead = {
  operation: string;
  document: { toString(): string };
  field: string;
  key: string;
};

const keyOf = (slug: string, locale: PublicLocale) => `${locale}:${slug}`;

const splitKey = (key: string) => {
  const separator = key.indexOf(":");
  return {
    locale: key.slice(0, separator) as PublicLocale,
    slug: key.slice(separator + 1),
  };
};

const hasRequestedVariant = (
  value: Record<string, unknown>,
  locale: PublicLocale,
) =>
  locale === "en" ||
  (Array.isArray(value.availableLocales) &&
    value.availableLocales.includes(toApiLanguage(locale)));

const readBySlug = async <T>({
  operation,
  document,
  field,
  key,
}: DetailRead): Promise<T | null> => {
  const { locale, slug } = splitKey(key);
  if (!isValidSlug(slug)) return null;
  const result = await executeServerGraphql({
    operation,
    document,
    field,
    variables: { slug, locale: toApiLanguage(locale) },
  });
  if (result.kind !== "found" || !isPublished(result.value)) return null;
  if (!hasRequestedVariant(result.value, locale)) {
    console.info(
      JSON.stringify({
        event: "public-content.variant-missing",
        operation,
        locale,
      }),
    );
    return null;
  }
  return result.value as T;
};

const readChildren = async <T>(
  operation: string,
  document: { toString(): string },
  field: string,
  variables: Record<string, string>,
): Promise<T[]> => {
  const result = await executeServerGraphql({
    operation,
    document,
    field,
    variables,
  });
  return result.kind === "found" ? (result.value as unknown as T[]) : [];
};

export const memoize = <T>(read: (key: string) => Promise<T>) => {
  const settled = cache((key: string) => settle(() => read(key)));
  return async (key: string) => unwrap(await settled(key));
};

const readCourseBySlug = memoize((key) =>
  readBySlug<PublicCourse>({
    key,
    field: "courseBySlug",
    operation: "CourseBySlug",
    document: CourseBySlugDocument,
  }),
);

export const getPublicCourse = (slug: string, locale: PublicLocale) =>
  readCourseBySlug(keyOf(slug, locale));

const readEventBySlug = memoize((key) =>
  readBySlug<PublicEvent>({
    key,
    field: "eventBySlug",
    operation: "EventBySlug",
    document: EventBySlugDocument,
  }),
);

export const getPublicEvent = (slug: string, locale: PublicLocale) =>
  readEventBySlug(keyOf(slug, locale));

const readPodcastBySlug = memoize((key) =>
  readBySlug<PublicPodcast>({
    key,
    field: "podcastBySlug",
    operation: "PodcastBySlug",
    document: PodcastBySlugDocument,
  }),
);

export const getPublicPodcast = (slug: string, locale: PublicLocale) =>
  readPodcastBySlug(keyOf(slug, locale));

const readYouTubeChannelBySlug = memoize((key) =>
  readBySlug<PublicYouTubeChannel>({
    key,
    field: "youtubeChannelBySlug",
    operation: "YouTubeChannelBySlug",
    document: YouTubeChannelBySlugDocument,
  }),
);

export const getPublicYouTubeChannel = (slug: string, locale: PublicLocale) =>
  readYouTubeChannelBySlug(keyOf(slug, locale));

export const getPublicPodcastEpisodes = memoize((podcastId) =>
  readChildren<PublicPodcastEpisode>(
    "PodcastEpisodes",
    PodcastEpisodesDocument,
    "podcastEpisodes",
    { podcastId },
  ),
);

export const getPublicYouTubeVideos = memoize((channelId) =>
  readChildren<PublicYouTubeVideo>(
    "YouTubeVideos",
    YouTubeVideosDocument,
    "youtubeVideos",
    { channelId },
  ),
);
