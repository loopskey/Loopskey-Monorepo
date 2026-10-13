"use client";

import { getByKey, isStringArray } from "@/utils/function-helper";
import { createContext, useMemo } from "react";

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
  const value = useMemo<I18nContextValue>(() => {
    const t: I18nContextValue["t"] = (key, params = {}, fallback = "") => {
      const rawValue = getByKey(dictionary, key);
      if (typeof rawValue !== "string") return fallback;
      let text = rawValue;
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replaceAll(`{{${paramKey}}}`, String(paramValue));
      });
      return text;
    };

    const ta: I18nContextValue["ta"] = (key) => {
      const rawValue = getByKey(dictionary, key);
      return isStringArray(rawValue) ? rawValue : [];
    };

    const traw: I18nContextValue["traw"] = (key, fallback) => {
      const rawValue = getByKey(dictionary, key);
      return rawValue === undefined ? (fallback as never) : (rawValue as never);
    };

    return {
      t,
      ta,
      traw,
      language,
      dir: "ltr",
      setLanguage: onSelectLanguage,
      isRouteLocked,
      toggleLanguage: () => onSelectLanguage(language === "en" ? "fr" : "en"),
    };
  }, [language, dictionary, isRouteLocked, onSelectLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
