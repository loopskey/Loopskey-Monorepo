"use client";

import { localizePath } from "@/lib/i18n/locale";
import { useCallback } from "react";
import { useI18n } from "@/hooks/useI18n";

export const useLocalizedHref = () => {
  const { language, isRouteLocked } = useI18n();

  return useCallback(
    (href: string) => (isRouteLocked ? localizePath(href, language) : href),
    [isRouteLocked, language],
  );
};
