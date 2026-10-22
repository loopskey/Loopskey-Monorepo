import { loadTranslator } from "@/i18n/dictionaries";
import { FooterContent } from "@layouts/parts/footer-content";

import type { PublicLocale } from "@/lib/i18n/locale";

const Footer = async ({ locale }: { locale: PublicLocale }) => {
  const { t } = await loadTranslator(locale);
  return <FooterContent t={t} />;
};

export default Footer;
