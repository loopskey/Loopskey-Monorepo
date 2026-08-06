import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("associations");

const AssociationsPage = () => {
  return <StaticInfoPage pageKey="associations" />;
};

export default AssociationsPage;
