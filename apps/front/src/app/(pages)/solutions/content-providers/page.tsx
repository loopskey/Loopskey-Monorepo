import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("solutionContentProviders");

const ContentProvidersPage = () => {
  return <StaticInfoPage pageKey="solutionContentProviders" />;
};

export default ContentProvidersPage;
