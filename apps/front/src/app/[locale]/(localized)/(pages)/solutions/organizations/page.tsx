import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "organizations",
  "/solutions/organizations",
);

const OrganizationsPage = () => <StaticInfoPage pageKey="organizations" />;

export default OrganizationsPage;
