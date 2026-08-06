import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("professionals");

const ProfessionalsPage = () => {
  return <StaticInfoPage pageKey="professionals" />;
};

export default ProfessionalsPage;
