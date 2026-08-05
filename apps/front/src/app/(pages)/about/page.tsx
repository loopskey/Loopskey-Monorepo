import { getStaticInfoMetadata, StaticInfoPage } from "@templates/StaticInfoPage";

export const metadata = getStaticInfoMetadata("about");

const AboutPage = () => {
  return <StaticInfoPage pageKey="about" />;
};

export default AboutPage;
