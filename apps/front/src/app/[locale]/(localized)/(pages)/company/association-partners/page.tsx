import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { StaticInfoPage } from "@templates/StaticInfoPage";
import { asPublicLocale } from "@/lib/i18n/route-locale";

export const generateMetadata = staticInfoMetadata(
  "associationPartners",
  "/company/association-partners",
);

const AssociationPartnersPage = async ({ params }: TLocalePageProps) => (
  <StaticInfoPage
    pageKey="associationPartners"
    locale={asPublicLocale((await params).locale)}
  />
);

export default AssociationPartnersPage;
