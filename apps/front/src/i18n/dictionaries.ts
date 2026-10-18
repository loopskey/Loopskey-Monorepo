import { TLanguage } from "@/types/providers.types";
import { translatorFor } from "@/lib/i18n/translator";

import en from "@/i18n/en.json";

export type Dictionary = typeof en;

export const defaultLanguage: TLanguage = "en";
export const defaultDictionary: Dictionary = en;

const loaders: Record<TLanguage, () => Promise<Dictionary>> = {
  en: async () => en,
  fr: async () =>
    (await import("@/i18n/fr.json")).default as unknown as Dictionary,
};

export const loadDictionary = (language: TLanguage): Promise<Dictionary> =>
  loaders[language]();

export const loadTranslator = async (language: TLanguage) =>
  translatorFor(await loadDictionary(language));
