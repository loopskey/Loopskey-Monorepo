import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { ClientMessages } from "@elements/client-messages";
import { asPublicLocale } from "@/lib/i18n/route-locale";

import TermsPageClient from "@templates/TermsPageClient";

export const generateMetadata = bespokePageMetadata("termsPage", "/terms");

const TermsPage = async ({ params }: TLocalePageProps) => (
  <ClientMessages scope="terms" locale={asPublicLocale((await params).locale)}>
    <TermsPageClient />
  </ClientMessages>
);

export default TermsPage;
