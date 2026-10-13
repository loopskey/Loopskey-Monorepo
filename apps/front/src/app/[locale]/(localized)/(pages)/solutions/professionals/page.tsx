import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata(
  "professionals",
  "/solutions/professionals",
);

const ProfessionalsPage = () => <StaticInfoPage pageKey="professionals" />;

export default ProfessionalsPage;
