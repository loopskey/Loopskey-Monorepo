import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("professionals");

const ProfessionalsPage = () => <StaticInfoPage pageKey="professionals" />;

export default ProfessionalsPage;
