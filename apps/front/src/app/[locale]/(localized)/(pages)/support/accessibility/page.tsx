import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "accessibility",
  "/support/accessibility",
);

const AccessibilityPage = () => <StaticInfoPage pageKey="accessibility" />;

export default AccessibilityPage;
