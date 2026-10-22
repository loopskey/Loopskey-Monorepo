"use client";

import { MAIN_CONTENT_ID, SkipToContent } from "@elements/skip-to-content";
import { RouteLanguageProvider } from "@/providers/route-language-provider";
import { PublicLanguageMenu } from "@elements/public-language-menu";
import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { useRouteLocale } from "@/providers/route-locale-provider";
import { useI18n } from "@/hooks/useI18n";

import NotFoundContent from "@modules/NotFound/NotFoundContent";
import publicEnglish from "@/i18n/generated/public.en.json";
import publicFrench from "@/i18n/generated/public.fr.json";
import AppFooter from "@layouts/AppFooter";
import Header from "@layouts/Header";

const SkipLink = () => {
  const { t } = useI18n();
  return <SkipToContent label={t("navigation.skipToContent")} />;
};

const StandaloneNotFound = () => {
  const locale = useRouteLocale();
  const dictionary = locale === "fr" ? publicFrench : publicEnglish;

  return (
    <RouteLanguageProvider language={locale} dictionary={dictionary}>
      <ActiveRoleProvider>
        <SkipLink />
        <Header languageControl={<PublicLanguageMenu />} />
        <div id={MAIN_CONTENT_ID} tabIndex={-1} className="outline-none">
          <NotFoundContent />
        </div>
        <AppFooter />
      </ActiveRoleProvider>
    </RouteLanguageProvider>
  );
};

export default StandaloneNotFound;
