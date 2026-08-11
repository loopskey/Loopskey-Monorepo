import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("associations");

const AssociationsPage = () => <StaticInfoPage pageKey="associations" />;

export default AssociationsPage;
