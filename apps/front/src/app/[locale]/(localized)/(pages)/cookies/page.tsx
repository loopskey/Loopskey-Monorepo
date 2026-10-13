import { staticInfoMetadata } from "@/utils/static-info-page.utils";
import { StaticInfoPage } from "@templates/StaticInfoPage";

export const generateMetadata = staticInfoMetadata("cookies", "/cookies");

const CookieStatementPage = () => <StaticInfoPage pageKey="cookies" />;

export default CookieStatementPage;
