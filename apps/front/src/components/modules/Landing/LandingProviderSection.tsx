"use client";

import { useLandingProviderShowcase } from "@hooks/useLandingProvider";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

const LandingProvider = () => {
  const { t, stats, funnel, benefits, dashboard, isLoading, hasApiError } =
    useLandingProviderShowcase();

  return (
    <section className="relative overflow-x-clip px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-16 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <RevealOnScroll direction="left">
            <div>
              <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
                {t("landing.provider.eyebrow")}
              </span>

              <h2 className="mt-5 text-3xl font-medium leading-tight text-foreground md:text-5xl">
                {t("landing.provider.title")}
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {t("landing.provider.description")}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;

                  return (
                    <RevealOnScroll
                      key={benefit.key}
                      delay={index * 90}
                      direction={index % 2 === 0 ? "left" : "right"}
                    >
                      <GlassCard
                        glow={false}
                        className="group h-full p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-primary/5"
                      >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-6 w-6" />
                        </div>

                        <h3 className="text-base font-semibold text-foreground">
                          {benefit.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {benefit.description}
                        </p>
                      </GlassCard>
                    </RevealOnScroll>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild radius="xl" variant="brand" size="lg">
                  <Link href="/contact">
                    {t("landing.provider.primaryAction")}
                    <L.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild radius="xl" variant="glass" size="lg">
                  <Link href="/services">
                    {t("landing.provider.secondaryAction")}
                  </Link>
                </Button>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={120}>
            <GlassCard className="relative overflow-hidden p-5 md:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.12),transparent_32%)]" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("landing.provider.dashboard.eyebrow")}
                    </p>

                    <p className="mt-1 font-bold text-foreground">
                      {dashboard.providerName}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {hasApiError && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-500">
                        {t("landing.provider.dashboard.demoData")}
                      </span>
                    )}

                    <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
                      {isLoading
                        ? t("common.loading")
                        : t("landing.provider.dashboard.status")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.key}
                      className="rounded-2xl border border-glass-border bg-background/45 p-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-glass-border bg-background/45 p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("landing.provider.dashboard.funnelTitle")}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("landing.provider.dashboard.funnelDescription")}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <L.Activity className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-5">
                    {funnel.map((item, index) => (
                      <div key={item.key}>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">
                            {item.label}
                          </span>

                          <span className="font-semibold text-foreground">
                            {item.value}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              index === 0 && "bg-primary",
                              index === 1 && "bg-accent",
                              index === 2 && "bg-emerald-500",
                            )}
                            style={{
                              width: `${item.value}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <L.Radar className="h-6 w-6" />
                    </div>

                    <p className="font-semibold text-foreground">
                      {t("landing.provider.dashboard.matchingTitle")}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t("landing.provider.dashboard.matchingDescription")}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <L.LineChart className="h-6 w-6" />
                    </div>

                    <p className="font-semibold text-foreground">
                      {t("landing.provider.dashboard.analyticsTitle")}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t("landing.provider.dashboard.analyticsDescription")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-glass-border bg-background/45 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("landing.provider.dashboard.topEventTitle")}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {dashboard.bestEventTitle}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <L.Trophy className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-background/50 p-4">
                      <p className="text-xs text-muted-foreground">
                        {t("landing.provider.dashboard.revenue")}
                      </p>
                      <p className="mt-2 font-bold text-foreground">
                        {dashboard.totalRevenue}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-background/50 p-4">
                      <p className="text-xs text-muted-foreground">
                        {t("landing.provider.dashboard.rating")}
                      </p>
                      <p className="mt-2 font-bold text-foreground">
                        {dashboard.avgRating}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-background/50 p-4">
                      <p className="text-xs text-muted-foreground">
                        {t("landing.provider.dashboard.registrations")}
                      </p>
                      <p className="mt-2 font-bold text-foreground">
                        {dashboard.bestEventRegistrations}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

export default LandingProvider;
