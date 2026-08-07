"use client";

import { defaultDictionary, defaultLanguage } from "@/i18n/dictionaries";
import { useMemo, useState, ReactNode } from "react";
import { I18nContextValue, TLanguage } from "@/types/providers.types";
import { Dictionary, loadDictionary } from "@/i18n/dictionaries";
import { createContext, useEffect } from "react";
import { getByKey, isStringArray } from "@/utils/function-helper";

export const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "app_language";

const isSupportedLanguage = (value: string | null): value is TLanguage =>
  value === "en" || value === "fr";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<TLanguage>(defaultLanguage);
  const [dict, setDict] = useState<Dictionary>(defaultDictionary);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(savedLanguage)) setLanguageState(savedLanguage);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
  }, [language]);

  useEffect(() => {
    let active = true;
    loadDictionary(language).then((loaded) => {
      if (active) setDict(loaded);
    });
    return () => {
      active = false;
    };
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const t: I18nContextValue["t"] = (key, params = {}, fallback = "") => {
      const rawValue = getByKey(dict, key);
      if (typeof rawValue !== "string") return fallback;
      let text = rawValue;
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replaceAll(`{{${paramKey}}}`, String(paramValue));
      });
      return text;
    };

    const ta: I18nContextValue["ta"] = (key) => {
      const rawValue = getByKey(dict, key);
      return isStringArray(rawValue) ? rawValue : [];
    };

    const traw: I18nContextValue["traw"] = (key, fallback) => {
      const rawValue = getByKey(dict, key);
      return rawValue === undefined ? (fallback as never) : (rawValue as never);
    };

    return {
      language,
      dir: "ltr",
      setLanguage: setLanguageState,
      toggleLanguage: () => {
        setLanguageState((current) => (current === "en" ? "fr" : "en"));
      },
      t,
      ta,
      traw,
    };
  }, [language, dict]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
