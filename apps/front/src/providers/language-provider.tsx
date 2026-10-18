"use client";

import { createContext, useMemo } from "react";
import { translatorFor } from "@/lib/i18n/translator";

import type { I18nContextValue, TLanguage } from "@/types/providers.types";
import type { ReactNode } from "react";

export const I18nContext = createContext<I18nContextValue | null>(null);

type TLanguageProviderProps = {
  children: ReactNode;
  language: TLanguage;
  dictionary: unknown;
  isRouteLocked: boolean;
  onSelectLanguage: (next: TLanguage) => void;
};

export const LanguageProvider = ({
  children,
  language,
  dictionary,
  isRouteLocked,
  onSelectLanguage,
}: TLanguageProviderProps) => {
  const value = useMemo<I18nContextValue>(
    () => ({
      ...translatorFor(dictionary),
      language,
      dir: "ltr",
      setLanguage: onSelectLanguage,
      isRouteLocked,
      toggleLanguage: () => onSelectLanguage(language === "en" ? "fr" : "en"),
    }),
    [language, dictionary, isRouteLocked, onSelectLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
