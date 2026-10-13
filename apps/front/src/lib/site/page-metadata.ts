import { SOCIAL_CARD_HEIGHT } from "@/lib/social-card/constants";
import { SOCIAL_CARD_WIDTH } from "@/lib/social-card/constants";
import { localizePath } from "@/lib/i18n/locale";
import { siteUrl } from "./site-url";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { Metadata } from "next";

const OPEN_GRAPH_LOCALE: Record<PublicLocale, string> = {
  en: "en_US",
  fr: "fr_FR",
};

export const localizedUrl = (path: string, locale: PublicLocale) =>
  siteUrl(localizePath(path, locale));

export const alternateLanguages = (
  path: string,
  locales: readonly PublicLocale[],
): Record<string, string> | undefined => {
  if (!locales.includes("fr")) return undefined;
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, localizedUrl(path, locale)]),
    ),
    "x-default": siteUrl(path),
  };
};

export const SITE_NAME = "LoopsKey";

export const SITE_DESCRIPTION =
  "Professional learning, CPD, events, providers and organization.";

export const SITE_FALLBACK_SOCIAL_CARD_PATH = "/api/social-card";

export const SITE_FALLBACK_SOCIAL_IMAGE = {
  url: SITE_FALLBACK_SOCIAL_CARD_PATH,
  width: SOCIAL_CARD_WIDTH,
  height: SOCIAL_CARD_HEIGHT,
  alt: `${SITE_NAME} — professional learning, CPD and compliance`,
} as const;

type SocialImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type SocialMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  images?: readonly SocialImage[];
  locale?: PublicLocale;
};

export const siteOpenGraph = ({
  title,
  description,
  path,
  locale = "en",
  images = [SITE_FALLBACK_SOCIAL_IMAGE],
}: SocialMetadataInput): NonNullable<Metadata["openGraph"]> => ({
  type: "website",
  siteName: SITE_NAME,
  locale: OPEN_GRAPH_LOCALE[locale],
  title,
  description,
  images: [...images],
  ...(path ? { url: localizedUrl(path, locale) } : {}),
});

export const siteTwitter = ({
  title,
  description,
  images = [SITE_FALLBACK_SOCIAL_IMAGE],
}: SocialMetadataInput): NonNullable<Metadata["twitter"]> => ({
  card: "summary_large_image",
  title,
  description,
  images: images.map((image) => image.url),
});

type PublicPageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  isTitleBranded?: boolean;
  locale?: PublicLocale;
  variants?: readonly PublicLocale[];
};

const STATIC_VARIANTS: readonly PublicLocale[] = ["en", "fr"];

export const publicPageMetadata = ({
  title,
  description,
  path,
  isTitleBranded = false,
  locale = "en",
  variants = STATIC_VARIANTS,
}: PublicPageMetadataInput): Metadata => {
  const languages = alternateLanguages(path, variants);
  return {
    title: isTitleBranded ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localizedUrl(path, locale),
      ...(languages ? { languages } : {}),
    },
    openGraph: siteOpenGraph({ title, description, path, locale }),
    twitter: siteTwitter({ title, description }),
  };
};

export const noindexMetadata = (): Metadata => ({
  robots: { index: false, follow: false },
});
