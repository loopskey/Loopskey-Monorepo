import { DEFAULT_PUBLIC_LOCALE, isPublicLocale } from "@/lib/i18n/locale";
import { defaultDictionary, loadDictionary } from "@/i18n/dictionaries";
import { publicPageMetadata } from "@/lib/site/page-metadata";
import { Metadata } from "next";

import { type PublicLocale } from "@/lib/i18n/locale";
import { type Dictionary } from "@/i18n/dictionaries";

import type { PageKey } from "@/utils/static-info-outline";
import type * as T from "@/types/pages.types";

export type BespokePageKey =
  | "aboutPage"
  | "contactPage"
  | "faqPage"
  | "termsPage"
  | "privacyPage"
  | "landing"
  | "servicesPage"
  | "content";

export const getStaticPageContent = (
  pageKey: PageKey,
  dictionary: Dictionary = defaultDictionary,
): T.TStaticInfoPageContent =>
  dictionary.staticPages[pageKey] as unknown as T.TStaticInfoPageContent;

type TLocaleRouteProps = { params: Promise<{ locale: string }> };

const routeLocale = async (props: TLocaleRouteProps): Promise<PublicLocale> => {
  const { locale } = await props.params;
  return isPublicLocale(locale) ? locale : DEFAULT_PUBLIC_LOCALE;
};

export const getStaticInfoMetadata = (
  pageKey: PageKey,
  path: string,
  dictionary: Dictionary = defaultDictionary,
  locale: PublicLocale = DEFAULT_PUBLIC_LOCALE,
): Metadata => {
  const page = getStaticPageContent(pageKey, dictionary);
  const descriptionBlock = page.blocks.find(
    (block) => block.type === "paragraph",
  );
  return publicPageMetadata({
    title: page.title,
    description: descriptionBlock?.text,
    path,
    locale,
  });
};

export const getBespokePageMetadata = (
  pageKey: BespokePageKey,
  path: string,
  dictionary: Dictionary = defaultDictionary,
  locale: PublicLocale = DEFAULT_PUBLIC_LOCALE,
): Metadata => {
  const { title, description } = dictionary[pageKey].meta;
  return publicPageMetadata({
    title,
    description,
    path,
    locale,
    isTitleBranded: true,
  });
};

export const staticInfoMetadata =
  (pageKey: PageKey, path: string) =>
  async (props: TLocaleRouteProps): Promise<Metadata> => {
    const locale = await routeLocale(props);
    return getStaticInfoMetadata(
      pageKey,
      path,
      await loadDictionary(locale),
      locale,
    );
  };

export const bespokePageMetadata =
  (pageKey: BespokePageKey, path: string) =>
  async (props: TLocaleRouteProps): Promise<Metadata> => {
    const locale = await routeLocale(props);
    return getBespokePageMetadata(
      pageKey,
      path,
      await loadDictionary(locale),
      locale,
    );
  };
