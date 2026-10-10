import { DEFAULT_PUBLIC_LOCALE, isPublicLocale } from "@/lib/i18n/locale";
import { defaultDictionary, loadDictionary } from "@/i18n/dictionaries";
import { publicPageMetadata } from "@/lib/site/page-metadata";
import { Metadata } from "next";

import { type PublicLocale } from "@/lib/i18n/locale";
import { type Dictionary } from "@/i18n/dictionaries";

import type * as T from "@/types/pages.types";

export type PageKey = keyof Dictionary["staticPages"];

export type BespokePageKey =
  | "aboutPage"
  | "contactPage"
  | "faqPage"
  | "termsPage"
  | "privacyPage"
  | "landing"
  | "servicesPage"
  | "content";

export const STATIC_INFO_EMAIL = "loopskey.dev@gmail.com";

export const getStaticPageContent = (
  pageKey: PageKey,
  dictionary: Dictionary = defaultDictionary,
): T.TStaticInfoPageContent =>
  dictionary.staticPages[pageKey] as unknown as T.TStaticInfoPageContent;

export const slugifyHeading = (text: string) =>
  text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

const groupBlocks = (
  blocks: T.TStaticInfoBlock[],
): T.TStaticInfoContentBlock[] => {
  const grouped: T.TStaticInfoContentBlock[] = [];
  for (const block of blocks) {
    if (block.type !== "listItem") {
      grouped.push({ type: "paragraph", text: block.text });
      continue;
    }
    const previous = grouped.at(-1);
    if (previous?.type === "list") {
      previous.items.push(block.text);
      continue;
    }
    grouped.push({ type: "list", items: [block.text] });
  }
  return grouped;
};

export const buildStaticInfoOutline = (
  page: T.TStaticInfoPageContent,
): T.TStaticInfoOutline => {
  const lead: T.TStaticInfoBlock[] = [];
  const sections: { title: string; blocks: T.TStaticInfoBlock[] }[] = [];
  for (const block of page.blocks) {
    if (block.type === "heading") {
      sections.push({ title: block.text, blocks: [] });
      continue;
    }
    const current = sections.at(-1);
    if (current) current.blocks.push(block);
    else lead.push(block);
  }

  const usedIds = new Set<string>();
  const withIds: T.TStaticInfoSection[] = sections.map((section) => {
    const base = `section-${slugifyHeading(section.title)}`;
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    return { id, title: section.title, blocks: groupBlocks(section.blocks) };
  });
  return {
    title: page.title,
    lead: groupBlocks(lead),
    sections: withIds,
    cta: page.cta,
  };
};

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
