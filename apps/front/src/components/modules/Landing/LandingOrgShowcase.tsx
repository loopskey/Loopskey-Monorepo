// src/components/modules/Landing/LandingOrganization.tsx

"use client";

import { useLandingOrganizationShowcase } from "@/hooks/useLandingOrgShowcase";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { cn } from "@lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

const LandingOrganization = () => {
  const { t, stats, features, complianceRows, trendingTopics } =
    useLandingOrganizationShowcase();

  return (
    <section className="relative overflow-x-clip px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-glass-border bg-slate-600 p-6 text-white shadow-2xl md:p-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
        <RevealOnScroll direction="left">
          <div>
            <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/80 backdrop-blur-xl">
              {t("landing.organization.eyebrow")}
            </span>

            <h2 className="mt-5 text-3xl font-medium leading-tight text-white md:text-5xl">
              {t("landing.organization.title")}
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/70">
              {t("landing.organization.description")}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <RevealOnScroll
                    key={feature.key}
                    delay={index * 80}
                    direction={index % 2 === 0 ? "left" : "right"}
                  >
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-primary/10">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {feature.title}
                      </p>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild radius="xl" variant="brand" size="lg">
                <Link href="/contact">
                  {t("landing.organization.primaryAction")}
                  <L.ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                radius="xl"
                variant="glass"
                className="border-white/15 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/services">
                  {t("landing.organization.secondaryAction")}
                </Link>
              </Button>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="right" delay={120}>
          <GlassCard className="relative overflow-hidden border-white/10 bg-white/[0.07] p-5 text-white shadow-2xl backdrop-blur-2xl">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-primary-foreground/60">
                    {t("landing.organization.dashboard.eyebrow")}
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {t("landing.organization.dashboard.title")}
                  </p>
                </div>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
                  {t("landing.organization.dashboard.status")}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.key}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <p className="text-xs text-primary-foreground/55">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                <p className="mb-4 text-xs font-semibold text-white">
                  {t("landing.organization.dashboard.complianceTitle")}
                </p>

                <div className="space-y-4">
                  {complianceRows.map((row, index) => (
                    <div key={row.key}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-primary-foreground/70">
                          {row.label}
                        </span>
                        <span className="font-semibold text-white">
                          {row.value}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            index === 0 && "bg-primary",
                            index === 1 && "bg-accent",
                            index === 2 && "bg-destructive",
                          )}
                          style={{
                            width: `${Math.min(Math.max(row.value, 0), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {trendingTopics.map((topic, index) => (
                  <RevealOnScroll
                    key={`${topic.title}-${index}`}
                    direction="up"
                    delay={index * 80}
                  >
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <L.TrendingUp className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {topic.title}
                        </p>
                      </div>

                      <span className="text-sm font-bold text-accent">
                        {topic.percentage}%
                      </span>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </GlassCard>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default LandingOrganization;
