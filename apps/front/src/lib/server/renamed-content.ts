import { permanentRedirect } from "next/navigation";
import { getCurrentSlug } from "@/lib/server/public-content";
import { publicPagePath } from "@/lib/content-catalog/public-path";
import { localizePath } from "@/lib/i18n/locale";

import type { PublicPageKind } from "@/lib/content-catalog/public-path";
import type { PublicLocale } from "@/lib/i18n/locale";

export const redirectToRenamedContent = async (
  kind: PublicPageKind,
  slug: string,
  locale: PublicLocale,
  isVisible: (currentSlug: string, locale: PublicLocale) => Promise<unknown>,
) => {
  const currentSlug = await getCurrentSlug(kind, slug);
  if (!currentSlug || currentSlug === slug) return;
  if (!(await isVisible(currentSlug, locale))) return;
  permanentRedirect(localizePath(publicPagePath(kind, currentSlug), locale));
};
