import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("companyContentProviders");

const CompanyContentProvidersPage = () => {
  return <StaticInfoPage pageKey="companyContentProviders" />;
};

export default CompanyContentProvidersPage;
