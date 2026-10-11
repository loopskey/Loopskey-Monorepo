import { contentSocialImagePath } from "@loopskey/api-contracts/upload";
import { executeServerGraphql } from "@/lib/server/graphql-server";
import { toApiLanguage } from "@/lib/i18n/locale";
import { API_ORIGIN } from "@/utils/api-origin.util";

import type { PublicLocale } from "@/lib/i18n/locale";

export type SocialCardKind = "course" | "event" | "podcast" | "youtube";

export type SocialCardContent = {
  title: string;
  category: string | null;
  published: boolean;
  imageUrl: string | null;
};

const QUERY: Record<SocialCardKind, { field: string; operation: string }> = {
  course: { field: "courseBySlug", operation: "SocialCardCourse" },
  event: { field: "eventBySlug", operation: "SocialCardEvent" },
  podcast: { field: "podcastBySlug", operation: "SocialCardPodcast" },
  youtube: { field: "youtubeChannelBySlug", operation: "SocialCardYouTube" },
};

export const isSocialCardKind = (value: string): value is SocialCardKind =>
  value === "course" ||
  value === "event" ||
  value === "podcast" ||
  value === "youtube";

const OVERRIDE_PREFIX = contentSocialImagePath("");

const OVERRIDE_ID_PATTERN = /^[a-z0-9]{20,32}$/;

const overrideImageUrl = (path: unknown) =>
  typeof path === "string" &&
  path.startsWith(OVERRIDE_PREFIX) &&
  OVERRIDE_ID_PATTERN.test(path.slice(OVERRIDE_PREFIX.length))
    ? `${API_ORIGIN}${path}`
    : null;

const sourceImageUrl = (row: Record<string, unknown>) =>
  typeof row.imageUrl === "string" && row.imageUrl.trim()
    ? row.imageUrl.trim()
    : null;

export const fetchSocialCardContent = async (
  kind: SocialCardKind,
  slug: string,
  locale: PublicLocale = "en",
): Promise<SocialCardContent | null> => {
  const { field, operation } = QUERY[kind];
  const query = `query ${operation}($slug: String!, $locale: AppLanguage) {
    ${field}(slug: $slug, locale: $locale) { title category status imageUrl socialImagePath availableLocales }
  }`;

  const result = await executeServerGraphql({
    operation,
    field,
    document: { toString: () => query },
    variables: { slug, locale: toApiLanguage(locale) },
  });
  if (result.kind !== "found") return null;

  const row = result.value;
  if (typeof row.title !== "string") return null;
  if (
    locale !== "en" &&
    !(
      Array.isArray(row.availableLocales) &&
      row.availableLocales.includes(toApiLanguage(locale))
    )
  )
    return null;

  return {
    title: row.title,
    category: typeof row.category === "string" ? row.category : null,
    published: row.status === "PUBLISHED",
    imageUrl: overrideImageUrl(row.socialImagePath) ?? sourceImageUrl(row),
  };
};
