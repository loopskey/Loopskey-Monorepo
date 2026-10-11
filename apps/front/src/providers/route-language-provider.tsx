"use client";

import { LanguageProvider } from "@/providers/language-provider";
import { switchLocalePath } from "@/lib/i18n/locale";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import type { TLanguage } from "@/types/providers.types";
import type { ReactNode } from "react";

type TRouteLanguageProviderProps = {
  children: ReactNode;
  language: TLanguage;
  dictionary: unknown;
};

export const RouteLanguageProvider = ({
  children,
  language,
  dictionary,
}: TRouteLanguageProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const onSelectLanguage = useCallback(
    (next: TLanguage) => {
      if (next === language) return;
      router.push(switchLocalePath(pathname, window.location.search, next));
    },
    [language, pathname, router],
  );

  return (
    <LanguageProvider
      isRouteLocked
      language={language}
      dictionary={dictionary}
      onSelectLanguage={onSelectLanguage}
    >
      {children}
    </LanguageProvider>
  );
};
