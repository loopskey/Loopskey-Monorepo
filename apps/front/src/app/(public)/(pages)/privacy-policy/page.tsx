import { getBespokePageMetadata } from "@/utils/static-info-page.utils";

import PrivacyPageClient from "@templates/PrivacyPageClient";

export const metadata = getBespokePageMetadata("privacyPage", "/privacy-policy");

const PrivacyPolicyPage = () => <PrivacyPageClient />;

export default PrivacyPolicyPage;
