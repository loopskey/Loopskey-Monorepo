import { getStaticInfoMetadata } from "@templates/StaticInfoPage";
import PrivacyPageClient from "./PrivacyPageClient";

export const metadata = getStaticInfoMetadata("privacy");

const PrivacyPolicyPage = () => {
  return <PrivacyPageClient />;
};

export default PrivacyPolicyPage;
