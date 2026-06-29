"use client";

import { benefits, milestones, statusConfig } from "@/utils/constant";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

const LandingRoadmapShowcase = () => {
  const { t } = useI18n();

  return (
    <section className="relative overflow-x-clip px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] px-4 sm:px-6 lg:px-8">
        <RevealOnScroll direction="left">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/60 px-4 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur-xl">
              <L.Compass className="h-4 w-4" />
              {t("landing.roadmapShowcase.badge")}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("landing.roadmapShowcase.title")}{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t("landing.roadmapShowcase.highlight")}
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {t("landing.roadmapShowcase.description")}
            </p>

            <div className="mt-7 grid gap-3">
              {benefits.map((item, index) => (
                <RevealOnScroll
                  key={item}
                  delay={index * 90}
                  direction={index % 2 === 0 ? "left" : "right"}
                >
                  <div className="flex items-start gap-3 rounded-2xl border border-glass-border bg-background/45 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-primary/5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <L.Check className="h-4 w-4" />
                    </div>

                    <p className="text-sm font-medium leading-6 text-foreground">
                      {t(`landing.roadmapShowcase.benefits.${item}`)}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild radius="xl" variant="brand" size="lg">
                <Link href="/contact">
                  {t("landing.roadmapShowcase.primaryAction")}
                  <L.ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild radius="xl" variant="glass" size="lg">
                <Link href="/services">
                  {t("landing.roadmapShowcase.secondaryAction")}
                </Link>
              </Button>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="right" delay={120}>
          <GlassCard className="relative overflow-hidden p-5 md:p-7">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_34%),radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.10),transparent_32%)]" />
            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-glass-border pb-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("landing.roadmapShowcase.preview.eyebrow")}
                </p>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {t("landing.roadmapShowcase.preview.title")}
                </h3>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.14)]" />
                {t("landing.roadmapShowcase.preview.status")}
              </span>
            </div>

            <div className="relative space-y-5">
              <div className="absolute bottom-8 left-7 top-8 w-px bg-glass-border md:left-8" />

              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                const status = statusConfig[milestone.status];
                const StatusIcon = status.icon;
                const isLast = index === milestones.length - 1;
                return (
                  <RevealOnScroll
                    key={milestone.key}
                    delay={index * 110}
                    direction="right"
                  >
                    <div className="relative grid grid-cols-[3.5rem_1fr] gap-4">
                      {!isLast && (
                        <div
                          className={cn(
                            "absolute left-7 top-12 h-[calc(100%+1.25rem)] w-px md:left-8",
                            status.lineClassName,
                          )}
                        />
                      )}

                      <div
                        className={cn(
                          "relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border text-sm transition-all duration-300 md:h-16 md:w-16",
                          status.circleClassName,
                          milestone.status === "active" && "animate-pulse",
                        )}
                      >
                        {milestone.status === "done" ? (
                          <StatusIcon className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      <div
                        className={cn(
                          "rounded-3xl border bg-background/50 p-4 shadow-sm backdrop-blur-xl transition-all duration-300",
                          milestone.status === "active"
                            ? "border-primary/30 bg-primary/5"
                            : "border-glass-border hover:border-primary/20 hover:bg-primary/5",
                        )}
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <h4 className="font-bold text-foreground">
                              {t(
                                `landing.roadmapShowcase.milestones.${milestone.key}.title`,
                              )}
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {t(
                                `landing.roadmapShowcase.milestones.${milestone.key}.meta`,
                              )}
                            </p>
                          </div>

                          <span
                            className={cn(
                              "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest",
                              milestone.status === "done" &&
                                "bg-primary/10 text-primary",
                              milestone.status === "active" &&
                                "bg-accent/10 text-accent",
                              milestone.status === "upcoming" &&
                                "bg-muted text-muted-foreground",
                            )}
                          >
                            {milestone.status === "done" && (
                              <L.Check className="h-3.5 w-3.5" />
                            )}
                            {milestone.status === "active" && (
                              <L.Sparkles className="h-3.5 w-3.5" />
                            )}
                            {milestone.status === "upcoming" && (
                              <L.Clock3 className="h-3.5 w-3.5" />
                            )}

                            {t(
                              `landing.roadmapShowcase.status.${milestone.status}`,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>

            <div className="mt-7 grid gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("landing.roadmapShowcase.metrics.cpd")}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">40</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {t("landing.roadmapShowcase.metrics.progress")}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">62%</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {t("landing.roadmapShowcase.metrics.next")}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  Jul 12
                </p>
              </div>
            </div>
          </GlassCard>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default LandingRoadmapShowcase;
