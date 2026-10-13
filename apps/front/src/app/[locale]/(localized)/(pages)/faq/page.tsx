import { bespokePageMetadata } from "@/utils/static-info-page.utils";

import HelpCenterPageClient from "@templates/HelpCenterPageClient";

export const generateMetadata = bespokePageMetadata("faqPage", "/faq");

const HelpCenterPage = () => <HelpCenterPageClient />;

export default HelpCenterPage;
