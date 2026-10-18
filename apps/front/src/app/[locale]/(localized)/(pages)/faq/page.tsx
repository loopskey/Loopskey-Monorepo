import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { ClientMessages } from "@elements/client-messages";
import { asPublicLocale } from "@/lib/i18n/route-locale";

import HelpCenterPageClient from "@templates/HelpCenterPageClient";

export const generateMetadata = bespokePageMetadata("faqPage", "/faq");

const HelpCenterPage = async ({ params }: TLocalePageProps) => (
  <ClientMessages scope="faq" locale={asPublicLocale((await params).locale)}>
    <HelpCenterPageClient />
  </ClientMessages>
);

export default HelpCenterPage;
