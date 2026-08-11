import { getStaticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("cookies");

const CookieStatementPage = () => <StaticInfoPage pageKey="cookies" />;

export default CookieStatementPage;
