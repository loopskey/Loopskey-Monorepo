import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("organizations");

const OrganizationsPage = () => <StaticInfoPage pageKey="organizations" />;

export default OrganizationsPage;
