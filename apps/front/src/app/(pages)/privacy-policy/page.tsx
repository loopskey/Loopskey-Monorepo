import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("privacy");

const PrivacyPolicyPage = () => {
  return <StaticInfoPage pageKey="privacy" />;
};

export default PrivacyPolicyPage;
