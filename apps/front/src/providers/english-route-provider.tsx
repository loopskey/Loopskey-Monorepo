"use client";

import { RouteLanguageProvider } from "@/providers/route-language-provider";
import { ReactNode } from "react";

import publicEnglish from "@/i18n/generated/public.en.json";

export const EnglishRouteProvider = ({ children }: { children: ReactNode }) => (
  <RouteLanguageProvider language="en" dictionary={publicEnglish}>
    {children}
  </RouteLanguageProvider>
);
