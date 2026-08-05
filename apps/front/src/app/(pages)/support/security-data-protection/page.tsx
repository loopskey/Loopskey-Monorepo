import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("security");

const SecurityPage = () => {
  return <StaticInfoPage pageKey="security" />;
};

export default SecurityPage;
