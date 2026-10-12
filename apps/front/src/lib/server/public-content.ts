import { ProviderPublicBylineForContentDocument } from "@/lib/graphql/operations/provider-public-profile";
import { ProviderPublicProfileBySlugDocument } from "@/lib/graphql/operations/provider-public-profile";
import { YouTubeChannelBySlugDocument } from "@/lib/graphql/operations/youtube";
import { TopicHubsForContentDocument } from "@/lib/graphql/operations/topic-hub";
import { ResolveContentUrlDocument } from "@/lib/graphql/operations/content-url";
import { TopicHubBySlugDocument } from "@/lib/graphql/operations/topic-hub";
import { PodcastEpisodesDocument } from "@/lib/graphql/operations/podcast";
import { PodcastBySlugDocument } from "@/lib/graphql/operations/podcast";
import { YouTubeVideosDocument } from "@/lib/graphql/operations/youtube";
import { CourseBySlugDocument } from "@/lib/graphql/operations/course";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { executeServerGraphql } from "@/lib/server/graphql-server";
import { CONTENT_SLUG_LIMITS } from "@loopskey/api-contracts/validation";
import { EventBySlugDocument } from "@/lib/graphql/operations/event";
import { TopicHubsDocument } from "@/lib/graphql/operations/topic-hub";
import { ContentUrlKind } from "@/lib/graphql/base";
import { toApiLanguage } from "@/lib/i18n/locale";
import { cache } from "react";

import type { ProviderPublicBylineForContentQuery } from "@/lib/graphql/operations/provider-public-profile";
import type { ProviderPublicProfileBySlugQuery } from "@/lib/graphql/operations/provider-public-profile";
import type { YouTubeChannelBySlugQuery } from "@/lib/graphql/operations/youtube";
import type { PodcastEpisodesQuery } from "@/lib/graphql/operations/podcast";
import type { TopicHubBySlugQuery } from "@/lib/graphql/operations/topic-hub";
import type { PodcastBySlugQuery } from "@/lib/graphql/operations/podcast";
import type { YouTubeVideosQuery } from "@/lib/graphql/operations/youtube";
import type { CourseBySlugQuery } from "@/lib/graphql/operations/course";
import type { EventBySlugQuery } from "@/lib/graphql/operations/event";
import type { TopicHubsQuery } from "@/lib/graphql/operations/topic-hub";
import type { PublicPageKind } from "@/lib/content-catalog/public-path";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { ContentKind } from "@/lib/content-catalog/detail-path";

export type PublicCourse = NonNullable<CourseBySlugQuery["courseBySlug"]>;
export type PublicEvent = NonNullable<EventBySlugQuery["eventBySlug"]>;
export type PublicPodcast = NonNullable<PodcastBySlugQuery["podcastBySlug"]>;
export type PublicPodcastEpisode =
  PodcastEpisodesQuery["podcastEpisodes"][number];
export type PublicYouTubeChannel = NonNullable<
  YouTubeChannelBySlugQuery["youtubeChannelBySlug"]
>;
export type PublicYouTubeVideo = YouTubeVideosQuery["youtubeVideos"][number];
export type PublicTopicHub = NonNullable<TopicHubBySlugQuery["topicHubBySlug"]>;
export type PublicTopicHubSummary = TopicHubsQuery["topicHubs"][number];
export type PublicProviderProfile = NonNullable<
  ProviderPublicProfileBySlugQuery["providerPublicProfileBySlug"]
>;
export type PublicProviderByline = NonNullable<
  ProviderPublicBylineForContentQuery["providerPublicBylineForContent"]
>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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
  slug.length <= CONTENT_SLUG_LIMITS.maxLength && SLUG_PATTERN.test(slug);

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
  variables: Record<string, unknown>,
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

const URL_KIND: Record<PublicPageKind, ContentUrlKind> = {
  course: ContentUrlKind.Course,
  event: ContentUrlKind.Event,
  podcast: ContentUrlKind.Podcast,
  youtube: ContentUrlKind.Youtube,
  topic: ContentUrlKind.Topic,
  provider: ContentUrlKind.Provider,
};

const readCurrentSlug = memoize(async (key) => {
  const separator = key.indexOf(":");
  const kind = key.slice(0, separator) as PublicPageKind;
  const slug = key.slice(separator + 1);
  if (!isValidSlug(slug)) return null;
  const result = await executeServerGraphql({
    operation: "ResolveContentUrl",
    document: ResolveContentUrlDocument,
    field: "resolveContentUrl",
    variables: { kind: URL_KIND[kind], slug },
  });
  if (result.kind !== "found") return null;
  return typeof result.value.slug === "string" ? result.value.slug : null;
});

export const getCurrentSlug = (kind: PublicPageKind, slug: string) =>
  readCurrentSlug(`${kind}:${slug}`);

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

const readTopicHubBySlug = memoize((key) =>
  readBySlug<PublicTopicHub>({
    key,
    field: "topicHubBySlug",
    operation: "TopicHubBySlug",
    document: TopicHubBySlugDocument,
  }),
);

export const getPublicTopicHub = (slug: string, locale: PublicLocale) =>
  readTopicHubBySlug(keyOf(slug, locale));

const readProviderProfileBySlug = memoize((key) =>
  readBySlug<PublicProviderProfile>({
    key,
    field: "providerPublicProfileBySlug",
    operation: "ProviderPublicProfileBySlug",
    document: ProviderPublicProfileBySlugDocument,
  }),
);

export const getPublicProviderProfile = (slug: string, locale: PublicLocale) =>
  readProviderProfileBySlug(keyOf(slug, locale));

const optional = async <T>(fallback: T, read: () => Promise<T>): Promise<T> => {
  try {
    return await read();
  } catch (error) {
    if (error instanceof UpstreamFailureError) return fallback;
    throw error;
  }
};

const CONTENT_KIND: Record<ContentKind, ContentUrlKind> = {
  course: ContentUrlKind.Course,
  event: ContentUrlKind.Event,
  podcast: ContentUrlKind.Podcast,
  youtube: ContentUrlKind.Youtube,
};

const readTopicHubSummaries = cache((locale: PublicLocale, take: number) =>
  optional<PublicTopicHubSummary[]>([], () =>
    readChildren<PublicTopicHubSummary>(
      "TopicHubs",
      TopicHubsDocument,
      "topicHubs",
      { locale: toApiLanguage(locale), take },
    ),
  ),
);

export const getPublicTopicHubSummaries = (locale: PublicLocale, take = 6) =>
  readTopicHubSummaries(locale, take);

const readContentTopicHubs = cache(
  (kind: ContentKind, contentId: string, locale: PublicLocale) =>
    optional<PublicTopicHubSummary[]>([], () =>
      readChildren<PublicTopicHubSummary>(
        "TopicHubsForContent",
        TopicHubsForContentDocument,
        "topicHubsForContent",
        {
          kind: CONTENT_KIND[kind],
          contentId,
          locale: toApiLanguage(locale),
        },
      ),
    ),
);

export const getContentTopicHubs = (
  kind: ContentKind,
  contentId: string,
  locale: PublicLocale,
) => readContentTopicHubs(kind, contentId, locale);

const readProviderByline = cache((kind: ContentKind, contentId: string) =>
  optional<PublicProviderByline | null>(null, async () => {
    const result = await executeServerGraphql({
      operation: "ProviderPublicBylineForContent",
      document: ProviderPublicBylineForContentDocument,
      field: "providerPublicBylineForContent",
      variables: { kind: CONTENT_KIND[kind], contentId },
    });
    return result.kind === "found"
      ? (result.value as unknown as PublicProviderByline)
      : null;
  }),
);

export const getProviderByline = (kind: ContentKind, contentId: string) =>
  readProviderByline(kind, contentId);
