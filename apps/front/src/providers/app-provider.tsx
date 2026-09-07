"use client";

import { LanguageProvider } from "@/providers/language-provider";
import { ReactNode } from "react";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return <LanguageProvider>{children}</LanguageProvider>;
};
