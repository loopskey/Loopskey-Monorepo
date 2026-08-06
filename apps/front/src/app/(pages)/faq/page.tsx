import { getStaticInfoMetadata } from "@templates/StaticInfoPage";
import HelpCenterPageClient from "./HelpCenterPageClient";

export const metadata = getStaticInfoMetadata("helpCenter");

const HelpCenterPage = () => {
  return <HelpCenterPageClient />;
};

export default HelpCenterPage;
