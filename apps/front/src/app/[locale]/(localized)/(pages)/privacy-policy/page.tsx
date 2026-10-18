import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { ClientMessages } from "@elements/client-messages";
import { asPublicLocale } from "@/lib/i18n/route-locale";

import PrivacyPageClient from "@templates/PrivacyPageClient";

export const generateMetadata = bespokePageMetadata(
  "privacyPage",
  "/privacy-policy",
);

const PrivacyPolicyPage = async ({ params }: TLocalePageProps) => (
  <ClientMessages
    scope="privacy"
    locale={asPublicLocale((await params).locale)}
  >
    <PrivacyPageClient />
  </ClientMessages>
);

export default PrivacyPolicyPage;
