import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "security",
  "/support/security-data-protection",
);

const SecurityPage = () => <StaticInfoPage pageKey="security" />;

export default SecurityPage;
