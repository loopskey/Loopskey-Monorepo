"use client";

import { RouteLanguageProvider } from "@/providers/route-language-provider";
import { PublicLanguageMenu } from "@elements/public-language-menu";
import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { useRouteLocale } from "@/providers/route-locale-provider";

import NotFoundContent from "@modules/NotFound/NotFoundContent";
import publicEnglish from "@/i18n/generated/public.en.json";
import publicFrench from "@/i18n/generated/public.fr.json";
import AppFooter from "@layouts/AppFooter";
import Header from "@layouts/Header";

const StandaloneNotFound = () => {
  const locale = useRouteLocale();

  return (
    <RouteLanguageProvider
      language={locale}
      dictionary={locale === "fr" ? publicFrench : publicEnglish}
    >
      <ActiveRoleProvider>
        <Header languageControl={<PublicLanguageMenu />} />
        <NotFoundContent />
        <AppFooter />
      </ActiveRoleProvider>
    </RouteLanguageProvider>
  );
};

export default StandaloneNotFound;
