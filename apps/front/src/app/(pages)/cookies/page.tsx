import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("cookies");

const CookieStatementPage = () => {
  return <StaticInfoPage pageKey="cookies" />;
};

export default CookieStatementPage;
