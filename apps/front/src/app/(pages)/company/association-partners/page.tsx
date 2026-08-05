import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("associationPartners");

const AssociationPartnersPage = () => {
  return <StaticInfoPage pageKey="associationPartners" />;
};

export default AssociationPartnersPage;
