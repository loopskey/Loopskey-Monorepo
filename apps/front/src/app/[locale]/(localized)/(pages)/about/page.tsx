import { bespokePageMetadata } from "@/utils/static-info-page.utils";

import AboutPageClient from "@templates/AboutPageClient";

export const generateMetadata = bespokePageMetadata("aboutPage", "/about");

const AboutPage = () => <AboutPageClient />;

export default AboutPage;
