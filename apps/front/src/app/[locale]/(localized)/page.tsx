import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { asPublicLocale } from "@/lib/i18n/route-locale";
import { loadDictionary } from "@/i18n/dictionaries";
import { identityGraph } from "@/lib/structured-data/graph";

import LandingPopularCategories from "@modules/Landing/LandingPopularCategories";
import LandingRoadmapShowcase from "@modules/Landing/LandingRoadmapShowcase";
import LandingTestimonials from "@modules/Landing/LandingTestimonial";
import LandingOrganization from "@modules/Landing/LandingOrgShowcase";
import LandingTopicGuides from "@modules/Landing/LandingTopicGuides";
import LandingNewFeature from "@modules/Landing/LandingNewFeature";
import LandingServices from "@modules/Landing/LandingServices";
import LandingProvider from "@modules/Landing/LandingProviderSection";
import LandingFeatured from "@modules/Landing/LandingFeatured";
import LandingHero from "@modules/Landing/LandingHero";
import JsonLd from "@elements/json-ld";

export const generateMetadata = bespokePageMetadata("landing", "/");

type THomePageProps = { params: Promise<{ locale: string }> };

const HomePage = async ({ params }: THomePageProps) => {
  const locale = asPublicLocale((await params).locale);
  const { title, description } = (await loadDictionary(locale)).landing.meta;

  return (
    <>
      <JsonLd
        nodes={identityGraph({ path: "/", name: title, locale, description })}
      />
      <LandingHero />
      <LandingFeatured />
      <LandingNewFeature />
      <LandingPopularCategories />
      <LandingTopicGuides locale={locale} />
      <LandingServices />
      <LandingRoadmapShowcase />
      <LandingOrganization />
      <LandingProvider />
      <LandingTestimonials />
    </>
  );
};

export default HomePage;
