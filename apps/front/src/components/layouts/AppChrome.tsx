import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { ScrollToTopButton } from "@elements/scroll-to-top-button";
import { LanguageToggleBtn } from "@elements/language-switcher";
import { ReactNode } from "react";

import AppFooter from "@layouts/AppFooter";
import Header from "@layouts/Header";

const AppChrome = ({ children }: { children: ReactNode }) => (
  <ActiveRoleProvider>
    <Header languageControl={<LanguageToggleBtn />} />
    {children}
    <AppFooter />
    <ScrollToTopButton />
  </ActiveRoleProvider>
);

export default AppChrome;
