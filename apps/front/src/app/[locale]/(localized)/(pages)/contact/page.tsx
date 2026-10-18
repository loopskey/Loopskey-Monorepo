import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { ClientMessages } from "@elements/client-messages";
import { asPublicLocale } from "@/lib/i18n/route-locale";

import ContactPageClient from "@templates/ContactPageClient";

export const generateMetadata = bespokePageMetadata("contactPage", "/contact");

const ContactPage = async ({ params }: TLocalePageProps) => (
  <ClientMessages
    scope="contact"
    locale={asPublicLocale((await params).locale)}
  >
    <ContactPageClient />
  </ClientMessages>
);

export default ContactPage;
