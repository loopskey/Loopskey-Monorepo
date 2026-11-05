"use client";

import { PublicLanguageSwitch } from "@elements/public-language-switch";
import { LanguageSwitch } from "@elements/language-switch";
import { useI18n } from "@/hooks/useI18n";

export const LanguageSwitcher = () => {
  const { isRouteLocked, setLanguage } = useI18n();

  if (isRouteLocked) return <PublicLanguageSwitch />;

  return <LanguageSwitch onSelect={setLanguage} />;
};
