import { LANDING_SERVICE_KEYS } from "@/utils/landing-sections.constant";
import { loadDictionary } from "@/i18n/dictionaries";
import { siteLinks } from "@/utils/site-navigation";

import type { PublicLocale } from "@/lib/i18n/locale";

import { LandingSection, LandingSectionHeading } from "./parts/LandingSection";
import LandingActionGroup from "./parts/LandingActionGroup";
import LandingFeatureCard from "./parts/LandingFeatureCard";

const TITLE_ID = "landing-services-title";

const LandingServices = async ({ locale }: { locale: PublicLocale }) => {
  const copy = (await loadDictionary(locale)).landing.services;

  return (
    <LandingSection labelledBy={TITLE_ID}>
      <LandingSectionHeading
        id={TITLE_ID}
        eyebrow={copy.badge}
        title={copy.title}
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {LANDING_SERVICE_KEYS.map((key) => (
          <li key={key} className="flex">
            <LandingFeatureCard title={copy.items[key].title}>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy.items[key].text}
              </p>
            </LandingFeatureCard>
          </li>
        ))}
      </ul>

      <LandingActionGroup
        align="center"
        className="mt-10"
        actions={[
          {
            kind: "link",
            key: "services",
            href: siteLinks.services,
            label: copy.viewAll,
            variant: "outline",
          },
        ]}
      />
    </LandingSection>
  );
};

export default LandingServices;
