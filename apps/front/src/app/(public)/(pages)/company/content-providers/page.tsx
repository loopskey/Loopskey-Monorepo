import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata(
  "companyContentProviders",
  "/company/content-providers",
);

const CompanyContentProvidersPage = () => (
  <StaticInfoPage pageKey="companyContentProviders" />
);

export default CompanyContentProvidersPage;
