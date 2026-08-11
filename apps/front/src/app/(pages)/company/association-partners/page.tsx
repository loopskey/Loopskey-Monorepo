import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("associationPartners");

const AssociationPartnersPage = () => (
  <StaticInfoPage pageKey="associationPartners" />
);

export default AssociationPartnersPage;
