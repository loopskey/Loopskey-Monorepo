import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { StaticInfoPage } from "@templates/StaticInfoPage";
import { asPublicLocale } from "@/lib/i18n/route-locale";

export const generateMetadata = staticInfoMetadata(
  "professionals",
  "/solutions/professionals",
);

const ProfessionalsPage = async ({ params }: TLocalePageProps) => (
  <StaticInfoPage
    pageKey="professionals"
    locale={asPublicLocale((await params).locale)}
  />
);

export default ProfessionalsPage;
