"use client";

import { createContext, useContext } from "react";
import { DEFAULT_PUBLIC_LOCALE } from "@/lib/i18n/locale";
import { TRouteLocale } from "@/types/providers.types";

import type { PublicLocale } from "@/lib/i18n/locale";

const RouteLocaleContext = createContext<PublicLocale>(DEFAULT_PUBLIC_LOCALE);

export const RouteLocaleProvider = ({ locale, children }: TRouteLocale) => (
  <RouteLocaleContext.Provider value={locale}>
    {children}
  </RouteLocaleContext.Provider>
);

export const useRouteLocale = () => useContext(RouteLocaleContext);
