import { LANDING_FAQ_IDS } from "@/utils/landing-sections.constant";
import { selectFaqEntries } from "@/utils/faq-selection";
import { loadDictionary } from "@/i18n/dictionaries";
import { siteLinks } from "@/utils/site-navigation";
import { ArrowRight } from "lucide-react";

import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "@elements/localized-link";

import { LandingSection, LandingSectionHeading } from "./parts/LandingSection";
import LandingFaqAccordion from "./parts/LandingFaqAccordion";

const TITLE_ID = "landing-faq-title";

const LandingFaq = async ({ locale }: { locale: PublicLocale }) => {
  const dictionary = await loadDictionary(locale);
  const copy = dictionary.landing.faq;
  const entries = selectFaqEntries(dictionary.faqPage.items, LANDING_FAQ_IDS);

  return (
    <LandingSection labelledBy={TITLE_ID}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="flex flex-col items-start gap-4">
          <LandingSectionHeading
            id={TITLE_ID}
            align="start"
            eyebrow={copy.badge}
            title={copy.title}
          />
          <Link
            href={siteLinks.faq}
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {copy.seeAll}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>

        <LandingFaqAccordion entries={entries} />
      </div>
    </LandingSection>
  );
};

export default LandingFaq;
