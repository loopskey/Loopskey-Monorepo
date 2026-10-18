"use client";

import { FooterContent } from "@layouts/parts/footer-content";
import { useI18n } from "@/hooks/useI18n";

const AppFooter = () => {
  const { t } = useI18n();
  return <FooterContent t={t} />;
};

export default AppFooter;
