import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { TLocalePageProps } from "@/types/pages.types";
import { StaticInfoPage } from "@templates/StaticInfoPage";
import { asPublicLocale } from "@/lib/i18n/route-locale";

export const generateMetadata = staticInfoMetadata(
  "solutionContentProviders",
  "/solutions/content-providers",
);

const ContentProvidersPage = async ({ params }: TLocalePageProps) => (
  <StaticInfoPage
    pageKey="solutionContentProviders"
    locale={asPublicLocale((await params).locale)}
  />
);

export default ContentProvidersPage;
