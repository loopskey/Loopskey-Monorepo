"use client";

import { useContentLocales } from "@/providers/content-locale-provider";
import { LanguageLinks } from "@elements/language-links";

export const PublicLanguageSwitch = () => {
  const available = useContentLocales() ?? undefined;
  return <LanguageLinks available={available} />;
};
