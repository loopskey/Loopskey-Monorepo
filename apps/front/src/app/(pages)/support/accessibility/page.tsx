import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("accessibility");

const AccessibilityPage = () => <StaticInfoPage pageKey="accessibility" />;

export default AccessibilityPage;
