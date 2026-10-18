import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { StaticInfoPage } from "@templates/StaticInfoPage";
import { asPublicLocale } from "@/lib/i18n/route-locale";

export const generateMetadata = staticInfoMetadata(
  "associations",
  "/solutions/associations",
);

const AssociationsPage = async ({ params }: TLocalePageProps) => (
  <StaticInfoPage
    pageKey="associations"
    locale={asPublicLocale((await params).locale)}
  />
);

export default AssociationsPage;
