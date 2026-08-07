import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import PrivacyPageClient from "./PrivacyPageClient";

export const metadata = getStaticInfoMetadata("privacy");

const PrivacyPolicyPage = () => <PrivacyPageClient />;

export default PrivacyPolicyPage;
