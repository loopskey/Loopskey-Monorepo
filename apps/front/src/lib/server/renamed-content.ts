import { contentDetailPath } from "@/lib/content-catalog/detail-path";
import { permanentRedirect } from "next/navigation";
import { getCurrentSlug } from "@/lib/server/public-content";
import { localizePath } from "@/lib/i18n/locale";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { ContentKind } from "@/lib/content-catalog/detail-path";

export const redirectToRenamedContent = async (
  kind: ContentKind,
  slug: string,
  locale: PublicLocale,
  isVisible: (currentSlug: string, locale: PublicLocale) => Promise<unknown>,
) => {
  const currentSlug = await getCurrentSlug(kind, slug);
  if (!currentSlug || currentSlug === slug) return;
  if (!(await isVisible(currentSlug, locale))) return;
  permanentRedirect(localizePath(contentDetailPath(kind, currentSlug), locale));
};
