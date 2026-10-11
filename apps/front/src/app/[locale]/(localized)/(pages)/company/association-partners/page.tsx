import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "associationPartners",
  "/company/association-partners",
);

const AssociationPartnersPage = () => (
  <StaticInfoPage pageKey="associationPartners" />
);

export default AssociationPartnersPage;
