import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("companyContentProviders");

const CompanyContentProvidersPage = () => (
  <StaticInfoPage pageKey="companyContentProviders" />
);

export default CompanyContentProvidersPage;
