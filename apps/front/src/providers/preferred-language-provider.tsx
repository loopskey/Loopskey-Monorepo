"use client";

import { defaultDictionary, defaultLanguage } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/providers/language-provider";
import { loadDictionary } from "@/i18n/dictionaries";
import { useEffect, useState } from "react";

import type { Dictionary } from "@/i18n/dictionaries";
import type { TLanguage } from "@/types/providers.types";
import type { ReactNode } from "react";

const STORAGE_KEY = "app_language";

const isSupportedLanguage = (value: string | null): value is TLanguage =>
  value === "en" || value === "fr";

export const PreferredLanguageProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [language, setLanguage] = useState<TLanguage>(defaultLanguage);
  const [dictionary, setDictionary] = useState<Dictionary>(defaultDictionary);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(saved)) setLanguage(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
  }, [language]);

  useEffect(() => {
    let isActive = true;
    loadDictionary(language).then((loaded) => {
      if (isActive) setDictionary(loaded);
    });
    return () => {
      isActive = false;
    };
  }, [language]);

  return (
    <LanguageProvider
      language={language}
      dictionary={dictionary}
      isRouteLocked={false}
      onSelectLanguage={setLanguage}
    >
      {children}
    </LanguageProvider>
  );
};
