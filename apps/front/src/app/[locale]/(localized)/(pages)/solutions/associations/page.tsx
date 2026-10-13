import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "associations",
  "/solutions/associations",
);

const AssociationsPage = () => <StaticInfoPage pageKey="associations" />;

export default AssociationsPage;
