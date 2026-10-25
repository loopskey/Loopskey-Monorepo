"use client";

import { isDetailPath, stripLocalePrefix } from "@/lib/i18n/locale";
import { LanguageLinks } from "@elements/language-links";
import { usePathname } from "next/navigation";

export const PublicLanguageMenu = () => {
  const pathname = usePathname();
  if (isDetailPath(pathname)) return null;
  if (stripLocalePrefix(pathname) === "/") return <LanguageLinks />;
  return <LanguageLinks variant="menu" />;
};
