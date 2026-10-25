import { LANDING_STEP_KEYS } from "@/utils/landing-sections.constant";
import { loadDictionary } from "@/i18n/dictionaries";

import type { PublicLocale } from "@/lib/i18n/locale";

import { LandingSection, LandingSectionHeading } from "./parts/LandingSection";
import LandingActionGroup from "./parts/LandingActionGroup";
import LandingFeatureCard from "./parts/LandingFeatureCard";

const TITLE_ID = "landing-steps-title";

const LandingSteps = async ({ locale }: { locale: PublicLocale }) => {
  const copy = (await loadDictionary(locale)).landing.steps;

  return (
    <LandingSection labelledBy={TITLE_ID} tone="muted">
      <LandingSectionHeading
        id={TITLE_ID}
        eyebrow={copy.badge}
        title={copy.title}
      />

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {LANDING_STEP_KEYS.map((key, index) => (
          <li key={key} className="flex">
            <LandingFeatureCard
              align="center"
              title={copy.items[key].title}
              marker={
                <span
                  aria-hidden
                  className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
                >
                  {index + 1}
                </span>
              }
            >
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {copy.items[key].text}
              </p>
            </LandingFeatureCard>
          </li>
        ))}
      </ol>

      <LandingActionGroup
        align="center"
        className="mt-10"
        actions={[
          {
            kind: "session",
            key: "start",
            intent: "start",
            variant: "primary",
          },
        ]}
      />
    </LandingSection>
  );
};

export default LandingSteps;
