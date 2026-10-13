import { alternateLanguages, localizedUrl } from "@/lib/site/page-metadata";
import { siteOpenGraph, siteTwitter } from "@/lib/site/page-metadata";
import { normalizeDescription } from "@/lib/content-catalog/snippet";
import { SOCIAL_CARD_HEIGHT } from "@/lib/social-card/constants";
import { contentDetailPath } from "@/lib/content-catalog/detail-path";
import { SOCIAL_CARD_WIDTH } from "@/lib/social-card/constants";

import type { SocialCardKind } from "@/lib/social-card/content";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { Metadata } from "next";

const KIND_FALLBACK_DESCRIPTION: Record<SocialCardKind, string> = {
  course: "Professional development course on LoopsKey.",
  event: "Professional development event on LoopsKey.",
  podcast: "Professional development podcast on LoopsKey.",
  youtube: "Professional development YouTube channel on LoopsKey.",
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

type ContentSeoOverrides = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  socialImageAlt?: string | null;
  excludeFromIndex?: boolean | null;
};

type ContentMetadataInput = {
  kind: SocialCardKind;
  slug: string;
  title: string;
  description: string | null | undefined;
  locale?: PublicLocale;
  variants?: readonly PublicLocale[];
  seo?: ContentSeoOverrides;
};

export const contentMetadata = ({
  kind,
  slug,
  title,
  description,
  locale = "en",
  variants = [],
  seo,
}: ContentMetadataInput): Metadata => {
  const path = contentDetailPath(kind, slug);
  const isExcluded = Boolean(seo?.excludeFromIndex);
  const pageTitle = seo?.seoTitle?.trim() || title;
  const summary =
    seo?.seoDescription?.trim() ||
    normalizeDescription(description, KIND_FALLBACK_DESCRIPTION[kind]);
  const languages = isExcluded ? undefined : alternateLanguages(path, variants);
  const image = {
    url: socialCardUrl(kind, slug, locale),
    width: SOCIAL_CARD_WIDTH,
    height: SOCIAL_CARD_HEIGHT,
    alt: seo?.socialImageAlt?.trim() || pageTitle,
  };

  return {
    title: pageTitle,
    description: summary,
    alternates: {
      canonical: localizedUrl(path, locale),
      ...(languages ? { languages } : {}),
    },
    ...(isExcluded ? { robots: { index: false, follow: true } } : {}),
    openGraph: siteOpenGraph({
      title: pageTitle,
      description: summary,
      path,
      locale,
      images: [image],
    }),
    twitter: siteTwitter({
      title: pageTitle,
      description: summary,
      images: [image],
    }),
  };
};
