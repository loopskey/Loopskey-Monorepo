import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { StaticInfoPage } from "@templates/StaticInfoPage";
import { asPublicLocale } from "@/lib/i18n/route-locale";

export const generateMetadata = staticInfoMetadata(
  "security",
  "/support/security-data-protection",
);

const SecurityPage = async ({ params }: TLocalePageProps) => (
  <StaticInfoPage
    pageKey="security"
    locale={asPublicLocale((await params).locale)}
  />
);

export default SecurityPage;
