import { getStaticInfoMetadata } from "@templates/StaticInfoPage";
import AboutPageClient from "./AboutPageClient";

export const metadata = getStaticInfoMetadata("about");

const AboutPage = () => {
  return <AboutPageClient />;
};

export default AboutPage;
