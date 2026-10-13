import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "solutionContentProviders",
  "/solutions/content-providers",
);

const ContentProvidersPage = () => (
  <StaticInfoPage pageKey="solutionContentProviders" />
);

export default ContentProvidersPage;
