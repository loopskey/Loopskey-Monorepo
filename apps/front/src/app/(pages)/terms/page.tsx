import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import TermsPageClient from "./TermsPageClient";

export const metadata = getStaticInfoMetadata("terms");

const TermsPage = () => <TermsPageClient />;

export default TermsPage;
