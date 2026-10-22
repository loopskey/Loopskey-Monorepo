import { pickMessages } from "@/lib/i18n/translator";

import type { PublicLocale } from "@/lib/i18n/locale";

import publicEnglish from "@/i18n/generated/public.en.json";
import publicFrench from "@/i18n/generated/public.fr.json";
import clientScopes from "@/i18n/client-scopes.json";

export type TClientScope = keyof typeof clientScopes;

const SLICES: Record<PublicLocale, unknown> = {
  en: publicEnglish,
  fr: publicFrench,
};

const picked = new Map<string, Record<string, unknown>>();

export const clientMessages = (locale: PublicLocale, scope: TClientScope) => {
  const key = `${locale}:${scope}`;
  const cached = picked.get(key);
  if (cached) return cached;
  const messages = pickMessages(SLICES[locale], clientScopes[scope]);
  picked.set(key, messages);
  return messages;
};
