import { MAIN_CONTENT_ID, SkipToContent } from "@elements/skip-to-content";
import { PublicLanguageMenu } from "@elements/public-language-menu";
import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { ScrollToTopButton } from "@elements/scroll-to-top-button";
import { loadTranslator } from "@/i18n/dictionaries";
import { ReactNode } from "react";

import type { PublicLocale } from "@/lib/i18n/locale";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";

type TPublicChromeProps = {
  locale: PublicLocale;
  children: ReactNode;
};

const PublicChrome = async ({ locale, children }: TPublicChromeProps) => {
  const { t } = await loadTranslator(locale);

  return (
    <ActiveRoleProvider>
      <SkipToContent label={t("navigation.skipToContent")} />
      <Header languageControl={<PublicLanguageMenu />} />
      <div id={MAIN_CONTENT_ID} tabIndex={-1} className="outline-none">
        {children}
      </div>
      <Footer locale={locale} />
      <ScrollToTopButton />
    </ActiveRoleProvider>
  );
};

export default PublicChrome;
