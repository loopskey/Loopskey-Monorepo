import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("helpCenter");

const HelpCenterPage = () => {
  return <StaticInfoPage pageKey="helpCenter" />;
};

export default HelpCenterPage;
