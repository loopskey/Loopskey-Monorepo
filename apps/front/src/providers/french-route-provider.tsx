"use client";

import { RouteLanguageProvider } from "@/providers/route-language-provider";
import { ReactNode } from "react";

import publicFrench from "@/i18n/generated/public.fr.json";

export const FrenchRouteProvider = ({ children }: { children: ReactNode }) => (
  <RouteLanguageProvider language="fr" dictionary={publicFrench}>
    {children}
  </RouteLanguageProvider>
);
