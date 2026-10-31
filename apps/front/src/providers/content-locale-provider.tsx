"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";
import type { PublicLocale } from "@/lib/i18n/locale";

type TContentLocales = readonly PublicLocale[] | null;

type TContentLocaleContext = {
  available: TContentLocales;
  setAvailable: (locales: TContentLocales) => void;
};

const ContentLocaleContext = createContext<TContentLocaleContext>({
  available: null,
  setAvailable: () => undefined,
});

// A content page is only published in some languages. The page reports which
// ones and the language menu in the header reads them, so the page itself does
// not need a second language switcher.
export const ContentLocaleProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [available, setAvailable] = useState<TContentLocales>(null);

  return (
    <ContentLocaleContext.Provider value={{ available, setAvailable }}>
      {children}
    </ContentLocaleContext.Provider>
  );
};

export const useContentLocales = () =>
  useContext(ContentLocaleContext).available;

export const useReportContentLocales = (locales: readonly PublicLocale[]) => {
  const { setAvailable } = useContext(ContentLocaleContext);
  const key = locales.join(",");

  useEffect(() => {
    setAvailable(key ? (key.split(",") as PublicLocale[]) : []);
    return () => setAvailable(null);
  }, [key, setAvailable]);
};
