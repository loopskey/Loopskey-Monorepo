import { ScrollToTopButton } from "@elements/scroll-to-top-button";
import { ReactNode } from "react";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ScrollToTopButton />
    </>
  );
};

export default PublicLayout;
