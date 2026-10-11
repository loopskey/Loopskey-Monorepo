import { SEO_LOCALES, effectiveSeo } from "@utils/content-seo.util";
import { AppLanguage } from "@prisma/client";

import type { ContentSeoSettingsEntity } from "@common/types/content-seo.types";
import type { SeoRow } from "@utils/content-seo.util";

export type SeoDefaultText = {
  title: string;
  description: string | null;
};

export const presentSeoSettings = (
  excludeFromIndex: boolean,
  rows: readonly SeoRow[],
  defaults: Record<AppLanguage, SeoDefaultText>,
): ContentSeoSettingsEntity => ({
  excludeFromIndex,
  locales: SEO_LOCALES.map((locale) => {
    const row = rows.find((candidate) => candidate.locale === locale);
    return {
      locale,
      version: row?.version ?? 0,
      seoTitle: row?.seoTitle ?? null,
      seoDescription: row?.seoDescription ?? null,
      socialImageId: row?.socialImageId ?? null,
      socialImagePath: effectiveSeo(row).socialImagePath,
      socialImageAlt: row?.socialImageAlt ?? null,
      defaultTitle: defaults[locale].title,
      defaultDescription: defaults[locale].description,
      updatedAt: row?.updatedAt ?? null,
    };
  }),
});
