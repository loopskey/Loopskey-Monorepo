import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { asPublicLocale } from "@/lib/i18n/route-locale";
import { ClientMessages } from "@elements/client-messages";
import { loadDictionary } from "@/i18n/dictionaries";
import { identityGraph } from "@/lib/structured-data/graph";
import { StoreProvider } from "@/providers/rtk-provider";

import LandingRoadmapShowcase from "@modules/Landing/LandingRoadmapShowcase";
import LandingOrganization from "@modules/Landing/LandingOrgShowcase";
import LandingHighlights from "@modules/Landing/LandingHighlights";
import LandingAudiences from "@modules/Landing/LandingAudiences";
import LandingFinalCta from "@modules/Landing/LandingFinalCta";
import LandingServices from "@modules/Landing/LandingServices";
import LandingFeatured from "@modules/Landing/LandingFeatured";
import LandingSteps from "@modules/Landing/LandingSteps";
import LandingHero from "@modules/Landing/LandingHero";
import LandingFaq from "@modules/Landing/LandingFaq";
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
      <ClientMessages scope="landing" locale={locale}>
        <StoreProvider>
          <main>
            <LandingHero />
            <LandingHighlights locale={locale} />
            <LandingFeatured />
            <LandingSteps locale={locale} />
            <LandingServices locale={locale} />
            <LandingRoadmapShowcase locale={locale} />
            <LandingOrganization locale={locale} />
            <LandingAudiences locale={locale} />
            <LandingFaq locale={locale} />
            <LandingFinalCta locale={locale} />
          </main>
        </StoreProvider>
      </ClientMessages>
    </>
  );
};

export default HomePage;
