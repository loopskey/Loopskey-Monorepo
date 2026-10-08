import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata(
  "security",
  "/support/security-data-protection",
);

const SecurityPage = () => <StaticInfoPage pageKey="security" />;

export default SecurityPage;
