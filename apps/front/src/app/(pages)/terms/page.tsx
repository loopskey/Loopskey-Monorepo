import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("terms");

const TermsPage = () => {
  return <StaticInfoPage pageKey="terms" />;
};

export default TermsPage;
