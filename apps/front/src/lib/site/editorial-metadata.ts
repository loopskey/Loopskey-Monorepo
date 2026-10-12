import { alternateLanguages, localizedUrl } from "@/lib/site/page-metadata";
import { siteOpenGraph, siteTwitter } from "@/lib/site/page-metadata";
import { normalizeDescription } from "@/lib/content-catalog/snippet";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { Metadata } from "next";

type EditorialMetadataInput = {
  path: string;
  title: string;
  description: string | null | undefined;
  fallbackDescription: string;
  locale: PublicLocale;
  variants: readonly PublicLocale[];
  excludeFromIndex: boolean;
  imageUrl?: string | null;
};

export const editorialMetadata = ({
  path,
  title,
  locale,
  imageUrl,
  variants,
  description,
  excludeFromIndex,
  fallbackDescription,
}: EditorialMetadataInput): Metadata => {
  const summary = normalizeDescription(description, fallbackDescription);
  const languages = excludeFromIndex
    ? undefined
    : alternateLanguages(path, variants);
  const images = imageUrl ? [{ url: imageUrl, alt: title }] : undefined;
  return {
    title,
    description: summary,
    alternates: {
      canonical: localizedUrl(path, locale),
      ...(languages ? { languages } : {}),
    },
    ...(excludeFromIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: siteOpenGraph({
      title,
      description: summary,
      path,
      locale,
      ...(images ? { images } : {}),
    }),
    twitter: siteTwitter({
      title,
      description: summary,
      ...(images ? { images } : {}),
    }),
  };
};
