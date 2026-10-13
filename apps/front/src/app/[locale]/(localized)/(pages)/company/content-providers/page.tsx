import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "companyContentProviders",
  "/company/content-providers",
);

const CompanyContentProvidersPage = () => (
  <StaticInfoPage pageKey="companyContentProviders" />
);

export default CompanyContentProvidersPage;
