"use client";

import { LanguageLinks } from "@elements/language-links";
import { isDetailPath } from "@/lib/i18n/locale";
import { usePathname } from "next/navigation";

export const PublicLanguageMenu = () => {
  const pathname = usePathname();
  if (isDetailPath(pathname)) return null;
  return <LanguageLinks variant="menu" />;
};
