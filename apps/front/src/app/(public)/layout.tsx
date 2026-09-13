import { ReactNode } from "react";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default PublicLayout;
