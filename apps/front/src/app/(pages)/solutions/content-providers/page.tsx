import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("solutionContentProviders");

const ContentProvidersPage = () => (
  <StaticInfoPage pageKey="solutionContentProviders" />
);

export default ContentProvidersPage;
