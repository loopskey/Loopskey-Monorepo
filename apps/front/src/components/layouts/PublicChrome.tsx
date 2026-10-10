import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { ScrollToTopButton } from "@elements/scroll-to-top-button";
import { ReactNode } from "react";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";

const PublicChrome = ({ children }: { children: ReactNode }) => (
  <ActiveRoleProvider>
    <Header />
    {children}
    <Footer />
    <ScrollToTopButton />
  </ActiveRoleProvider>
);

export default PublicChrome;
