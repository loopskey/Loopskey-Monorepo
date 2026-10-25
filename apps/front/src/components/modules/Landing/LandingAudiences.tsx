import { LANDING_AUDIENCES } from "@/utils/landing-sections.constant";
import { solutionEntries } from "@/utils/site-navigation";
import { loadDictionary } from "@/i18n/dictionaries";
import { ArrowRight } from "lucide-react";

import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "@elements/localized-link";

import { LandingSection, LandingSectionHeading } from "./parts/LandingSection";
import LandingFeatureCard from "./parts/LandingFeatureCard";

const TITLE_ID = "landing-audiences-title";

const LandingAudiences = async ({ locale }: { locale: PublicLocale }) => {
  const copy = (await loadDictionary(locale)).landing.audiences;
  const audiences = LANDING_AUDIENCES.flatMap(({ key, role }) => {
    const entry = solutionEntries.find((solution) => solution.role === role);
    return entry ? [{ key, href: entry.footerHref, ...copy.items[key] }] : [];
  });

  return (
    <LandingSection labelledBy={TITLE_ID} tone="muted">
      <LandingSectionHeading
        id={TITLE_ID}
        eyebrow={copy.badge}
        title={copy.title}
      />

      <ul className="mt-12 grid gap-5 lg:grid-cols-3">
        {audiences.map((audience) => (
          <li key={audience.key} className="flex">
            <LandingFeatureCard title={audience.title}>
              <ul className="mt-5 space-y-2.5 border-t pt-5">
                {audience.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm leading-6 text-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href={audience.href}
                className="group mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-semibold text-primary hover:underline"
              >
                {audience.link}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </Link>
            </LandingFeatureCard>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
};

export default LandingAudiences;
