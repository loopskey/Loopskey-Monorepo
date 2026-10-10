import { DEFAULT_PUBLIC_LOCALE, fromApiLanguage } from "@/lib/i18n/locale";
import { isPublicLocale } from "@/lib/i18n/locale";

import type { AppLanguage } from "@/lib/graphql/base";
import type { PublicLocale } from "@/lib/i18n/locale";

export const asPublicLocale = (value: string): PublicLocale =>
  isPublicLocale(value) ? value : DEFAULT_PUBLIC_LOCALE;

export const variantsOf = (
  available: readonly AppLanguage[] | null | undefined,
): PublicLocale[] => (available ?? []).map(fromApiLanguage);
