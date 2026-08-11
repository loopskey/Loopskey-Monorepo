import { getBespokePageMetadata } from "@/utils/static-info-page.utils";

import HelpCenterPageClient from "@templates/HelpCenterPageClient";

export const metadata = getBespokePageMetadata("faqPage");

const HelpCenterPage = () => <HelpCenterPageClient />;

export default HelpCenterPage;
