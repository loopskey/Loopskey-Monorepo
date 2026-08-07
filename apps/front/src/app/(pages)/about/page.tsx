import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import AboutPageClient from "./AboutPageClient";

export const metadata = getStaticInfoMetadata("about");

const AboutPage = () => <AboutPageClient />;

export default AboutPage;
