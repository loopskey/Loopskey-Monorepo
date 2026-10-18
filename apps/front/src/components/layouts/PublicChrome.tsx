import { PublicLanguageMenu } from "@elements/public-language-menu";
import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { ScrollToTopButton } from "@elements/scroll-to-top-button";
import { ReactNode } from "react";

import type { PublicLocale } from "@/lib/i18n/locale";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";

type TPublicChromeProps = {
  locale: PublicLocale;
  children: ReactNode;
};

const PublicChrome = ({ locale, children }: TPublicChromeProps) => (
  <ActiveRoleProvider>
    <Header languageControl={<PublicLanguageMenu />} />
    {children}
    <Footer locale={locale} />
    <ScrollToTopButton />
  </ActiveRoleProvider>
);

export default PublicChrome;
