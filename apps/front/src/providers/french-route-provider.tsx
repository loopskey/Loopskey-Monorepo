"use client";

import { LanguageProvider } from "@/providers/language-provider";
import { Dictionary } from "@/i18n/dictionaries";
import { ReactNode } from "react";

import fr from "@/i18n/fr.json";

const frenchDictionary = fr as unknown as Dictionary;

export const FrenchRouteProvider = ({ children }: { children: ReactNode }) => (
  <LanguageProvider routeLanguage="fr" routeDictionary={frenchDictionary}>
    {children}
  </LanguageProvider>
);
