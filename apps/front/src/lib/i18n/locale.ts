import { AppLanguage } from "@/lib/graphql/base";

export type PublicLocale = "en" | "fr";

export const PUBLIC_LOCALES: readonly PublicLocale[] = ["en", "fr"];
export const DEFAULT_PUBLIC_LOCALE: PublicLocale = "en";
export const FRENCH_PREFIX = "/fr";

export const LOCALIZED_ROOTS: readonly string[] = [
  "about",
  "company",
  "contact",
  "content",
  "cookies",
  "courses",
  "events",
  "faq",
  "podcasts",
  "privacy-policy",
  "services",
  "solutions",
  "support",
  "terms",
  "youtube",
];

export const isPublicLocale = (value: string): value is PublicLocale =>
  (PUBLIC_LOCALES as readonly string[]).includes(value);

const rootSegmentOf = (path: string) => path.split(/[/?#]/).filter(Boolean)[0];

export const isLocalizablePath = (path: string) => {
  if (!path.startsWith("/")) return false;
  const root = rootSegmentOf(path);
  return root === undefined || LOCALIZED_ROOTS.includes(root);
};

const DETAIL_PATH_PATTERN =
  /^(?:\/(?:fr|en))?\/(?:courses|events|podcasts|youtube)\/[^/]+\/?$/;

export const isDetailPath = (pathname: string) =>
  DETAIL_PATH_PATTERN.test(pathname);

const LOCALE_PREFIXES = [FRENCH_PREFIX, "/en"];

export const stripLocalePrefix = (pathname: string) => {
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
};

export const localeOfPathname = (pathname: string): PublicLocale =>
  pathname === FRENCH_PREFIX || pathname.startsWith(`${FRENCH_PREFIX}/`)
    ? "fr"
    : DEFAULT_PUBLIC_LOCALE;

export const localizePath = (path: string, locale: PublicLocale) => {
  if (locale === DEFAULT_PUBLIC_LOCALE || !isLocalizablePath(path)) return path;
  if (path === "/") return FRENCH_PREFIX;
  if (path.startsWith("/?")) return `${FRENCH_PREFIX}${path.slice(1)}`;
  return `${FRENCH_PREFIX}${path}`;
};

export const switchLocalePath = (
  pathname: string,
  search: string,
  locale: PublicLocale,
) => {
  const unprefixed = stripLocalePrefix(pathname);
  return localizePath(`${unprefixed}${search}`, locale);
};

export const toApiLanguage = (locale: PublicLocale) =>
  locale === "fr" ? AppLanguage.Fr : AppLanguage.En;

export const fromApiLanguage = (language: AppLanguage): PublicLocale =>
  language === AppLanguage.Fr ? "fr" : "en";
