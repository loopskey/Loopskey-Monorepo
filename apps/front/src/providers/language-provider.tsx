"use client";

import { createContext, useCallback, useEffect } from "react";
import { defaultDictionary, defaultLanguage } from "@/i18n/dictionaries";
import { TLanguage, TLanguageProvider } from "@/types/providers.types";
import { Dictionary, loadDictionary } from "@/i18n/dictionaries";
import { getByKey, isStringArray } from "@/utils/function-helper";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { I18nContextValue } from "@/types/providers.types";
import { switchLocalePath } from "@/lib/i18n/locale";

export const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "app_language";

const isSupportedLanguage = (value: string | null): value is TLanguage =>
  value === "en" || value === "fr";

export const LanguageProvider = ({
  children,
  routeLanguage,
  routeDictionary,
}: TLanguageProvider) => {
  const isRouteLocked = routeLanguage !== undefined;
  const router = useRouter();
  const pathname = usePathname();
  const [preferredLanguage, setPreferredLanguage] =
    useState<TLanguage>(defaultLanguage);
  const [preferredDictionary, setPreferredDictionary] =
    useState<Dictionary>(defaultDictionary);

  const language = routeLanguage ?? preferredLanguage;
  const dict = routeDictionary ?? preferredDictionary;

  useEffect(() => {
    if (isRouteLocked) return;
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(savedLanguage)) setPreferredLanguage(savedLanguage);
  }, [isRouteLocked]);

  useEffect(() => {
    if (isRouteLocked) return;
    window.localStorage.setItem(STORAGE_KEY, preferredLanguage);
    document.documentElement.lang = preferredLanguage;
    document.documentElement.dir = "ltr";
  }, [isRouteLocked, preferredLanguage]);

  useEffect(() => {
    if (isRouteLocked) return;
    let active = true;
    loadDictionary(preferredLanguage).then((loaded) => {
      if (active) setPreferredDictionary(loaded);
    });
    return () => {
      active = false;
    };
  }, [isRouteLocked, preferredLanguage]);

  const setLanguage = useCallback(
    (next: TLanguage) => {
      if (!isRouteLocked) {
        setPreferredLanguage(next);
        return;
      }
      if (next === language) return;
      router.push(switchLocalePath(pathname, window.location.search, next));
    },
    [isRouteLocked, language, pathname, router],
  );

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
      t,
      ta,
      traw,
      language,
      dir: "ltr",
      setLanguage,
      isRouteLocked,
      toggleLanguage: () => setLanguage(language === "en" ? "fr" : "en"),
    };
  }, [language, dict, isRouteLocked, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
