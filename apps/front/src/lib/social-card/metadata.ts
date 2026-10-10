import { alternateLanguages, localizedUrl } from "@/lib/site/page-metadata";
import { siteOpenGraph, siteTwitter } from "@/lib/site/page-metadata";
import { SOCIAL_CARD_HEIGHT } from "@/lib/social-card/constants";
import { SOCIAL_CARD_WIDTH } from "@/lib/social-card/constants";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { SocialCardKind } from "@/lib/social-card/content";
import type { Metadata } from "next";

const DESCRIPTION_MAX_LENGTH = 160;

const KIND_PATH: Record<SocialCardKind, string> = {
  course: "/courses",
  event: "/events",
  podcast: "/podcasts",
  youtube: "/youtube",
};

const KIND_FALLBACK_DESCRIPTION: Record<SocialCardKind, string> = {
  course: "Professional development course on LoopsKey.",
  event: "Professional development event on LoopsKey.",
  podcast: "Professional development podcast on LoopsKey.",
  youtube: "Professional development YouTube channel on LoopsKey.",
};

export const normalizeDescription = (
  text: string | null | undefined,
  fallback: string,
): string => {
  const collapsed = (text ?? "").replace(/\s+/g, " ").trim();
  if (!collapsed) return fallback;
  if (collapsed.length <= DESCRIPTION_MAX_LENGTH) return collapsed;
  const cut = collapsed.slice(0, DESCRIPTION_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const boundary =
    lastSpace > DESCRIPTION_MAX_LENGTH / 2 ? lastSpace : cut.length;
  return `${cut.slice(0, boundary).trimEnd()}…`;
};

const socialCardUrl = (
  kind: SocialCardKind,
  slug: string,
  locale: PublicLocale,
) =>
  `/api/social-card/${kind}/${encodeURIComponent(slug)}${
    locale === "en" ? "" : `?locale=${locale}`
  }`;

export const contentSocialMetadata = (
  kind: SocialCardKind,
  slug: string,
  locale: PublicLocale = "en",
): Metadata => {
  const images = [
    {
      url: socialCardUrl(kind, slug, locale),
      width: SOCIAL_CARD_WIDTH,
      height: SOCIAL_CARD_HEIGHT,
    },
  ];

  return {
    openGraph: siteOpenGraph({ images, locale }),
    twitter: siteTwitter({ images }),
  };
};

type ContentMetadataInput = {
  kind: SocialCardKind;
  slug: string;
  title: string;
  description: string | null | undefined;
  locale?: PublicLocale;
  variants?: readonly PublicLocale[];
};

export const contentMetadata = ({
  kind,
  slug,
  title,
  description,
  locale = "en",
  variants = [],
}: ContentMetadataInput): Metadata => {
  const path = `${KIND_PATH[kind]}/${encodeURIComponent(slug)}`;
  const summary = normalizeDescription(
    description,
    KIND_FALLBACK_DESCRIPTION[kind],
  );
  const languages = alternateLanguages(path, variants);
  const image = {
    url: socialCardUrl(kind, slug, locale),
    width: SOCIAL_CARD_WIDTH,
    height: SOCIAL_CARD_HEIGHT,
    alt: title,
  };

  return {
    title,
    description: summary,
    alternates: {
      canonical: localizedUrl(path, locale),
      ...(languages ? { languages } : {}),
    },
    openGraph: siteOpenGraph({
      title,
      description: summary,
      path,
      locale,
      images: [image],
    }),
    twitter: siteTwitter({
      title,
      description: summary,
      images: [image],
    }),
  };
};
