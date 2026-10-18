import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { StaticInfoPage } from "@templates/StaticInfoPage";
import { asPublicLocale } from "@/lib/i18n/route-locale";

export const generateMetadata = staticInfoMetadata(
  "companyContentProviders",
  "/company/content-providers",
);

const CompanyContentProvidersPage = async ({ params }: TLocalePageProps) => (
  <StaticInfoPage
    pageKey="companyContentProviders"
    locale={asPublicLocale((await params).locale)}
  />
);

export default CompanyContentProvidersPage;
