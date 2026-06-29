"use client";

import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Link from "next/link";

import * as C from "@/utils/constant";
import * as L from "lucide-react";

const AboutPage = () => {
  const { t } = useI18n();

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-[-10rem] top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-12rem] top-[30rem] h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        <RevealOnScroll direction="left" className="relative z-10">
          <Badge variant="secondary" className="rounded-full px-4 py-2">
            {t("aboutPage.hero.badge")}
          </Badge>

          <h1 className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight text-foreground md:text-6xl">
            {t("aboutPage.hero.titleStart")}{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t("aboutPage.hero.titleHighlight")}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {t("aboutPage.hero.description")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild radius="xl" variant="brand" size="lg">
              <Link href={C.siteLinks.contact}>
                {t("aboutPage.hero.primaryCta")}
                <L.ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild radius="xl" variant="glass" size="lg">
              <Link href={C.siteLinks.services}>
                {t("aboutPage.hero.secondaryCta")}
              </Link>
            </Button>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="right" className="relative z-10">
          <GlassCard className="overflow-hidden p-0">
            <div className="relative min-h-[430px] bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_35%)]" />
              <div className="relative z-10 grid h-full gap-4">
                <GlassCard glow={false} className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <L.Award className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-3xl font-medium">
                        {t("aboutPage.hero.stats.professionals.value")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("aboutPage.hero.stats.professionals.label")}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard glow={false} className="ml-8 p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <L.Compass className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-3xl font-medium">
                        {t("aboutPage.hero.stats.countries.value")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("aboutPage.hero.stats.countries.label")}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard glow={false} className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <L.Sparkles className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-3xl font-medium">
                        {t("aboutPage.hero.stats.ai.value")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("aboutPage.hero.stats.ai.label")}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
              {t("aboutPage.story.eyebrow")}
            </span>

            <h2 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">
              {t("aboutPage.story.title")}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <RevealOnScroll direction="left">
            <GlassCard className="h-full p-7">
              <p className="text-base leading-8 text-muted-foreground">
                {t("aboutPage.story.paragraphOne")}
              </p>
            </GlassCard>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={120}>
            <GlassCard className="h-full p-7">
              <p className="text-base leading-8 text-muted-foreground">
                {t("aboutPage.story.paragraphTwo")}
              </p>
            </GlassCard>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {C.missionVision.map((item, index) => {
            const Icon = item.icon;
            return (
              <RevealOnScroll
                key={item.key}
                direction={index % 2 === 0 ? "left" : "right"}
                delay={index * 120}
              >
                <GlassCard className="group h-full p-7 transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-5 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-2xl font-medium">
                    {t(`aboutPage.missionVision.${item.key}.title`)}
                  </h3>

                  <p className="mt-3 leading-7 text-muted-foreground">
                    {t(`aboutPage.missionVision.${item.key}.description`)}
                  </p>
                </GlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <RevealOnScroll>
          <div className="max-w-3xl">
            <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
              {t("aboutPage.values.eyebrow")}
            </span>

            <h2 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">
              {t("aboutPage.values.title")}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {C.values.map((item, index) => {
            const Icon = item.icon;
            return (
              <RevealOnScroll
                key={item.key}
                delay={index * 100}
                direction={item.direction}
              >
                <GlassCard className="group h-full p-6 transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-5 inline-flex rounded-2xl bg-primary/10 p-3 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium">
                    {t(`aboutPage.values.items.${item.key}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {t(`aboutPage.values.items.${item.key}.description`)}
                  </p>
                </GlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <RevealOnScroll>
          <div className="max-w-3xl">
            <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
              {t("aboutPage.team.eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">
              {t("aboutPage.team.title")}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {C.team.map((member, index) => (
            <RevealOnScroll
              key={member.key}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={index * 120}
            >
              <GlassCard className="group h-full p-6 text-center transition-all duration-300 hover:-translate-y-1">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-xl font-medium text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-105">
                  {member.initials}
                </div>
                <h3 className="mt-5 text-lg font-medium">
                  {t(`aboutPage.team.members.${member.key}.name`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`aboutPage.team.members.${member.key}.role`)}
                </p>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <RevealOnScroll>
          <div className="max-w-3xl">
            <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
              {t("aboutPage.timeline.eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">
              {t("aboutPage.timeline.title")}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="mt-12 overflow-x-auto pb-4">
          <div className="relative min-w-[900px]">
            <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
            <div className="grid grid-cols-4 gap-5">
              {C.timeline.map((item, index) => (
                <RevealOnScroll key={item.key} delay={index * 120}>
                  <div className="relative">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-background shadow-xl">
                      <span className="text-lg font-medium text-primary">
                        {item.year}
                      </span>
                    </div>
                    <GlassCard className="mt-6 h-full p-5 text-center">
                      <h3 className="text-lg font-medium">
                        {t(`aboutPage.timeline.items.${item.key}.title`)}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {t(`aboutPage.timeline.items.${item.key}.description`)}
                      </p>
                    </GlassCard>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <RevealOnScroll>
          <div className="max-w-3xl">
            <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
              {t("aboutPage.trust.eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">
              {t("aboutPage.trust.title")}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {C.trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <RevealOnScroll
                key={item.key}
                delay={index * 120}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <GlassCard className="h-full p-6">
                  <div className="mb-5 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-medium">
                    {t(`aboutPage.trust.items.${item.key}.title`)}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {t(`aboutPage.trust.items.${item.key}.description`)}
                  </p>
                </GlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <RevealOnScroll>
          <GlassCard className="relative overflow-hidden p-8 md:p-12">
            <div className="pointer-events-none absolute right-0 top-0 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Badge variant="secondary" className="rounded-full">
                  {t("aboutPage.cta.badge")}
                </Badge>
                <h2 className="mt-5 text-3xl font-medium md:text-4xl">
                  {t("aboutPage.cta.title")}
                </h2>
                <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                  {t("aboutPage.cta.description")}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {["professionals", "organizations"].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/10 p-1 text-primary">
                        <L.Check className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {t(`aboutPage.cta.points.${item}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button asChild radius="xl" variant="brand" size="lg">
                <Link href={C.siteLinks.contact}>
                  {t("aboutPage.cta.button")}
                  <L.ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </GlassCard>
        </RevealOnScroll>
      </section>
    </main>
  );
};

export default AboutPage;
