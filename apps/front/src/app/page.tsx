import LandingPopularCategories from "@modules/Landing/LandingPopularCategories";
import LandingRoadmapShowcase from "@modules/Landing/LandingRoadmapShowcase";
import LandingTestimonials from "@modules/Landing/LandingTestimonial";
import LandingOrganization from "@modules/Landing/LandingOrgShowcase";
import LandingNewFeature from "@modules/Landing/LandingNewFeature";
import LandingServices from "@modules/Landing/LandingServices";
import LandingProvider from "@modules/Landing/LandingProviderSection";
import LandingFeatured from "@modules/Landing/LandingFeatured";
import LandingHero from "@modules/Landing/LandingHero";

const HomePage = () => {
  return (
    <>
      <LandingHero />
      <LandingFeatured />
      <LandingNewFeature />
      <LandingPopularCategories />
      <LandingServices />
      <LandingRoadmapShowcase />
      <LandingOrganization />
      <LandingProvider />
      <LandingTestimonials />
    </>
  );
};

export default HomePage;
