import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("organizations");

const OrganizationsPage = () => {
  return <StaticInfoPage pageKey="organizations" />;
};

export default OrganizationsPage;
