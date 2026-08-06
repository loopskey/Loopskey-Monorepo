import { getStaticInfoMetadata } from "@templates/StaticInfoPage";
import TermsPageClient from "./TermsPageClient";

export const metadata = getStaticInfoMetadata("terms");

const TermsPage = () => {
  return <TermsPageClient />;
};

export default TermsPage;
