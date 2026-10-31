import { MAIN_CONTENT_ID, SkipToContent } from "@elements/skip-to-content";
import { ContentLocaleProvider } from "@/providers/content-locale-provider";
import { PublicLanguageMenu } from "@elements/public-language-menu";
import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { TPublicChromeProps } from "@/types/layouts.types";
import { ScrollToTopButton } from "@elements/scroll-to-top-button";
import { loadTranslator } from "@/i18n/dictionaries";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";

const PublicChrome = async ({ locale, children }: TPublicChromeProps) => {
  const { t } = await loadTranslator(locale);

  return (
    <ActiveRoleProvider>
      <ContentLocaleProvider>
        <SkipToContent label={t("navigation.skipToContent")} />
        <Header languageControl={<PublicLanguageMenu />} />
        <div id={MAIN_CONTENT_ID} tabIndex={-1} className="outline-none">
          {children}
        </div>
        <Footer locale={locale} />
        <ScrollToTopButton />
      </ContentLocaleProvider>
    </ActiveRoleProvider>
  );
};

export default PublicChrome;
