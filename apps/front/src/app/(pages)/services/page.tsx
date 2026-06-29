"use client";

import { services, siteLinks, valueCards } from "@utils/constant";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import ServiceBlock from "@modules/Pages/ServiceBlock";
import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";

const ServicesPage = () => {
  const { t } = useI18n();

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-8%] top-[28rem] h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <RevealOnScroll direction="left" className="flex items-center">
          <div>
            <Badge className="rounded-full px-4 py-1.5">
              <L.Sparkles className="mr-2 h-3.5 w-3.5" />
              {t("servicesPage.hero.badge")}
            </Badge>

            <h1 className="mt-6 max-w-4xl text-4xl font-medium tracking-tight text-foreground md:text-6xl">
              {t("servicesPage.hero.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t("servicesPage.hero.titleHighlight")}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t("servicesPage.hero.description")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild radius="xl" size="lg" variant="brand">
                <Link href={"/content"}>
                  {t("servicesPage.common.bookConsultation")}
                  <L.ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild radius="xl" size="lg" variant="glass">
                <Link href="#services">
                  {t("servicesPage.hero.exploreServices")}
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <GlassCard key={index} glow={false} className="p-4">
                  <p className="text-2xl font-semibold text-primary">
                    {t(`servicesPage.hero.stats.${index}.value`)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`servicesPage.hero.stats.${index}.label`)}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="right" delay={120}>
          <GlassCard className="relative overflow-hidden p-0">
            <div className="absolute left-5 top-5 z-20 rounded-full border border-white/20 bg-background/70 px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-xl">
              {t("servicesPage.hero.visualLabel")}
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image
                fill
                priority
                className="object-cover"
                src="/service-roadmap.jpg"
                alt={t("servicesPage.hero.visualAlt")}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/10 to-primary/20" />
              <div className="absolute bottom-5 left-5 right-5 grid gap-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-background/70 p-3 shadow-xl backdrop-blur-xl"
                  >
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <L.Check className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">
                      {t(`servicesPage.hero.visualPoints.${index}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center">
            <Badge variant="secondary" className="rounded-full">
              <L.Compass className="mr-2 h-3.5 w-3.5" />
              {t("servicesPage.value.badge")}
            </Badge>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {t("servicesPage.value.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t("servicesPage.value.description")}
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {valueCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <RevealOnScroll
                key={card.key}
                delay={index * 90}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <GlassCard className="h-full p-5">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary w-fit">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">
                    {t(`servicesPage.value.cards.${card.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(`servicesPage.value.cards.${card.key}.description`)}
                  </p>
                </GlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>
      <section
        id="services"
        className="mx-auto max-w-7xl space-y-8 px-4 py-20 sm:px-6 lg:px-8"
      >
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="rounded-full">
              {t("servicesPage.services.badge")}
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              {t("servicesPage.services.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t("servicesPage.services.description")}
            </p>
          </div>
        </RevealOnScroll>

        <div className="space-y-8">
          {services.map((service, index) => (
            <ServiceBlock
              index={index}
              key={service.key}
              service={service}
              consultationHref={"/content"}
            />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <GlassCard className="overflow-hidden p-0">
            <div className="relative grid gap-8 p-8 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
              <div>
                <Badge variant="secondary" className="rounded-full">
                  {t("servicesPage.cta.badge")}
                </Badge>
                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                  {t("servicesPage.cta.title")}
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  {t("servicesPage.cta.description")}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild radius="xl" size="lg" variant="brand">
                  <Link href={"/content"}>
                    {t("servicesPage.common.bookConsultation")}
                    <L.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild radius="xl" size="lg" variant="glass">
                  <Link href={siteLinks.content ?? "/content"}>
                    {t("servicesPage.cta.exploreContent")}
                  </Link>
                </Button>
              </div>
            </div>
          </GlassCard>
        </RevealOnScroll>
      </section>
    </main>
  );
};

export default ServicesPage;
