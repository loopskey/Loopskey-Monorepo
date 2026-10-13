import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import TermsPageClient from "@templates/TermsPageClient";

export const generateMetadata = bespokePageMetadata("termsPage", "/terms");

const TermsPage = () => <TermsPageClient />;

export default TermsPage;
