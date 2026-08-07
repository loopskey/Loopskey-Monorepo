import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import HelpCenterPageClient from "./HelpCenterPageClient";

export const metadata = getStaticInfoMetadata("helpCenter");

const HelpCenterPage = () => <HelpCenterPageClient />;

export default HelpCenterPage;
