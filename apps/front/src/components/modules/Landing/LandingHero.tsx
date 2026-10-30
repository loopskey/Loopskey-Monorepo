"use client";

import { useI18n } from "@/hooks/useI18n";
import { siteLinks } from "@/utils/site-navigation";

import LandingActionGroup from "./parts/LandingActionGroup";
import Image from "next/image";

const TITLE_ID = "landing-hero-title";

const LandingHero = () => {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby={TITLE_ID}
      className="relative overflow-x-clip bg-[radial-gradient(ellipse_at_top_right,var(--color-accent),transparent_55%)]"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8 lg:pb-16 lg:pt-16">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-accent/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {t("landing.hero.badge")}
          </p>

          <h1
            id={TITLE_ID}
            className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            <span className="block text-brand-sky-large-text">
              {t("landing.hero.titleLine1")}
            </span>{" "}
            <span className="block text-brand-navy">
              {t("landing.hero.titleLine2")}
            </span>{" "}
            <span className="block text-brand-orange-large-text">
              {t("landing.hero.titleLine3")}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("landing.hero.subtitle")}
          </p>

          <LandingActionGroup
            size="xl"
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
                key: "explore",
                href: siteLinks.content,
                label: t("landing.hero.exploreLearning"),
                variant: "outline",
              },
            ]}
          />
        </div>

        <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="relative aspect-[600/638] w-full">
            <Image
              fill
              alt=""
              priority
              src="/hero.png"
              className="object-contain"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 512px, 576px"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
