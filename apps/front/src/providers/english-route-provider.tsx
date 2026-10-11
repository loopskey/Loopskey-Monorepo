"use client";

import { defaultDictionary } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/providers/language-provider";
import { ReactNode } from "react";

export const EnglishRouteProvider = ({ children }: { children: ReactNode }) => (
  <LanguageProvider routeLanguage="en" routeDictionary={defaultDictionary}>
    {children}
  </LanguageProvider>
);
