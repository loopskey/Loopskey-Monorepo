"use client";

import { I18nContextValue } from "@/types/providers.types";
import { I18nContext } from "@/providers/language-provider";
import { useContext } from "react";

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within LanguageProvider");
  return context;
};
