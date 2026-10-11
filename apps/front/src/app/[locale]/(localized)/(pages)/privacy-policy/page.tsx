import { bespokePageMetadata } from "@/utils/static-info-page.utils";

import PrivacyPageClient from "@templates/PrivacyPageClient";

export const generateMetadata = bespokePageMetadata(
  "privacyPage",
  "/privacy-policy",
);

const PrivacyPolicyPage = () => <PrivacyPageClient />;

export default PrivacyPolicyPage;
