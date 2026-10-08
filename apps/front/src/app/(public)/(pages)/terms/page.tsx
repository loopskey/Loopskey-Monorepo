import { getBespokePageMetadata } from "@/utils/static-info-page.utils";
import TermsPageClient from "@templates/TermsPageClient";

export const metadata = getBespokePageMetadata("termsPage", "/terms");

const TermsPage = () => <TermsPageClient />;

export default TermsPage;
