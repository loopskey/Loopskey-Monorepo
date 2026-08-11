import { getBespokePageMetadata } from "@/utils/static-info-page.utils";

import AboutPageClient from "@templates/AboutPageClient";

export const metadata = getBespokePageMetadata("aboutPage");

const AboutPage = () => <AboutPageClient />;

export default AboutPage;
