"use client";

import { ArrowRight, Map, Milestone, Route, UsersRound } from "lucide-react";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Link from "next/link";

const LandingNewFeature = () => {
  const { t } = useI18n();

  const cards = [
    {
      icon: Route,
      title: t("landing.newFeature.cards.structured.title"),
      text: t("landing.newFeature.cards.structured.text"),
    },
    {
      icon: UsersRound,
      title: t("landing.newFeature.cards.community.title"),
      text: t("landing.newFeature.cards.community.text"),
    },
    {
      icon: Milestone,
      title: t("landing.newFeature.cards.progress.title"),
      text: t("landing.newFeature.cards.progress.text"),
    },
  ];

  return (
    <section className="relative overflow-x-clip px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] px-4 sm:px-6 lg:px-8">
        <RevealOnScroll direction="left">
          <GlassCard className="h-full p-7 md:p-9">
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                <Map className="h-4 w-4" />
                {t("landing.newFeature.badge")}
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {t("landing.newFeature.title")}
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
                {t("landing.newFeature.description")}
              </p>

              <div className="mt-8 rounded-[2rem] border border-glass-border bg-background/45 p-5 backdrop-blur-xl">
                <h3 className="text-xl font-bold">
                  {t("landing.newFeature.ctaTitle")}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {t("landing.newFeature.ctaText")}
                </p>

                <Button
                  asChild
                  className="mt-5"
                  variant="brand"
                  radius="xl"
                  size="lg"
                >
                  <Link href="/roadmaps">
                    {t("landing.newFeature.ctaButton")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </GlassCard>
        </RevealOnScroll>

        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <RevealOnScroll
                key={card.title}
                direction="right"
                delay={index * 120}
              >
                <GlassCard className="p-5" glow={false}>
                  <div className="relative z-10 flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {card.text}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingNewFeature;
