import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { ClientMessages } from "@elements/client-messages";
import { asPublicLocale } from "@/lib/i18n/route-locale";

import ServicesPageClient from "@templates/ServicesPageClient";

export const generateMetadata = bespokePageMetadata(
  "servicesPage",
  "/services",
);

const ServicesPage = async ({ params }: TLocalePageProps) => (
  <ClientMessages
    scope="services"
    locale={asPublicLocale((await params).locale)}
  >
    <ServicesPageClient />
  </ClientMessages>
);

export default ServicesPage;
