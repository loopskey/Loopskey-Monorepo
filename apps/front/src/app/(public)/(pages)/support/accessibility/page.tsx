import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata(
  "accessibility",
  "/support/accessibility",
);

const AccessibilityPage = () => <StaticInfoPage pageKey="accessibility" />;

export default AccessibilityPage;
