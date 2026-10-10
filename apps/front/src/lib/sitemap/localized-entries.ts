import { AppLanguage } from "@/lib/graphql/base";
import { localizePath } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/site/site-url";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { SitemapAlternate, SitemapEntry } from "@/lib/sitemap/xml";

const alternatesFor = (
  path: string,
  locales: readonly PublicLocale[],
): SitemapAlternate[] => {
  if (!locales.includes("fr")) return [];
  return [
    ...locales.map((locale) => ({
      hreflang: locale,
      location: siteUrl(localizePath(path, locale)),
    })),
    { hreflang: "x-default", location: siteUrl(path) },
  ];
};

export const localizedEntries = (
  path: string,
  locales: readonly PublicLocale[],
  lastModified?: Date | null,
): SitemapEntry[] => {
  const alternates = alternatesFor(path, locales);
  const entries: SitemapEntry[] = [
    { location: siteUrl(path), lastModified, alternates },
  ];
  if (locales.includes("fr"))
    entries.push({
      location: siteUrl(localizePath(path, "fr")),
      lastModified,
      alternates,
    });
  return entries;
};

export const publicLocalesOf = (
  available: readonly AppLanguage[],
): PublicLocale[] =>
  available.map((language) => (language === AppLanguage.Fr ? "fr" : "en"));
