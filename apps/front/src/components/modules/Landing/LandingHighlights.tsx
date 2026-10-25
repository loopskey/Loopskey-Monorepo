import { LANDING_HIGHLIGHT_KEYS } from "@/utils/landing-sections.constant";
import { loadDictionary } from "@/i18n/dictionaries";

import type { PublicLocale } from "@/lib/i18n/locale";

import { LANDING_CONTAINER_CLASS_NAME } from "./parts/LandingSection";

const LandingHighlights = async ({ locale }: { locale: PublicLocale }) => {
  const copy = (await loadDictionary(locale)).landing.highlights;

  return (
    <section aria-label={copy.label} className="pb-6 sm:pb-10">
      <div className={LANDING_CONTAINER_CLASS_NAME}>
        <ul className="grid divide-y rounded-2xl border bg-card shadow-sm md:grid-cols-3 md:divide-x md:divide-y-0">
          {LANDING_HIGHLIGHT_KEYS.map((key) => (
            <li key={key} className="flex gap-4 px-6 py-5 sm:py-6">
              <span
                aria-hidden
                className="w-1 shrink-0 self-stretch rounded-full bg-brand-orange"
              />
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {copy.items[key].title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {copy.items[key].text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LandingHighlights;
