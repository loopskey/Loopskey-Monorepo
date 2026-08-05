import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("accessibility");

const AccessibilityPage = () => {
  return <StaticInfoPage pageKey="accessibility" />;
};

export default AccessibilityPage;
