import { loadDictionary } from "@/i18n/dictionaries";
import { siteLinks } from "@/utils/site-navigation";

import type { PublicLocale } from "@/lib/i18n/locale";

import { LANDING_CONTAINER_CLASS_NAME } from "./parts/LandingSection";
import LandingActionGroup from "./parts/LandingActionGroup";

const TITLE_ID = "landing-final-cta-title";

const LandingFinalCta = async ({ locale }: { locale: PublicLocale }) => {
  const copy = (await loadDictionary(locale)).landing.finalCta;

  return (
    <section aria-labelledby={TITLE_ID} className="pt-4">
      <div className={LANDING_CONTAINER_CLASS_NAME}>
        <div className="rounded-3xl border bg-gradient-to-br from-accent/60 via-background to-brand-orange/10 px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2
            id={TITLE_ID}
            className="mx-auto max-w-lg text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {copy.description}
          </p>
          <LandingActionGroup
            align="center"
            className="mt-8"
            actions={[
              {
                kind: "session",
                key: "account",
                intent: "account",
                variant: "primary",
                withArrow: true,
              },
              {
                kind: "link",
                key: "contact",
                href: siteLinks.contact,
                label: copy.contact,
                variant: "outline",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default LandingFinalCta;
