"use client";

import { BriefcaseBusiness, Code2, GraduationCap, Wrench } from "lucide-react";
import { HeartPulse, Landmark, Megaphone, ShieldCheck } from "lucide-react";
import { usePopularCategoriesQuery } from "@/lib/rtk/endpoints/landing.api";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

const iconMap = {
  TECHNOLOGY: Code2,
  FINANCE: Landmark,
  ENGINEERING: Wrench,
  MARKETING: Megaphone,
  HEALTHCARE: HeartPulse,
  COMPLIANCE: ShieldCheck,
  EDUCATION: GraduationCap,
  BUSINESS: BriefcaseBusiness,
};

const LandingPopularCategories = () => {
  const { t } = useI18n();

  const {
    data: categories = [],
    isLoading,
    isFetching,
  } = usePopularCategoriesQuery({
    take: 8,
  });

  const loading = isLoading || isFetching;

  return (
    <section className="relative overflow-x-clip px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-10 top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/60 px-4 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur-xl">
              {t("landing.popularCategories.badge")}
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("landing.popularCategories.title")}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {t("landing.popularCategories.subtitle")}
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <GlassCard key={index} className="h-44 animate-pulse p-5" />
              ))
            : categories.map((item, index) => {
                const Icon =
                  iconMap[item.category as keyof typeof iconMap] ??
                  GraduationCap;

                return (
                  <RevealOnScroll
                    key={item.category}
                    delay={index * 80}
                    direction={index % 2 === 0 ? "left" : "right"}
                  >
                    <GlassCard className="group h-full p-5" glow={false}>
                      <div className="relative z-10">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                            <Icon className="h-5 w-5" />
                          </div>

                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            {item.averageRating.toFixed(1)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold">
                          {t(
                            `content.enums.courseCategory.${item.category}`,
                            {},
                            item.category,
                          )}
                        </h3>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {t("landing.popularCategories.itemsCount", {
                            count: item.totalItems,
                          })}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="rounded-2xl bg-background/45 p-2">
                            {t("landing.popularCategories.courses")}:{" "}
                            <span className="font-bold text-foreground">
                              {item.courseCount}
                            </span>
                          </div>

                          <div className="rounded-2xl bg-background/45 p-2">
                            {t("landing.popularCategories.events")}:{" "}
                            <span className="font-bold text-foreground">
                              {item.eventCount}
                            </span>
                          </div>

                          <div className="rounded-2xl bg-background/45 p-2">
                            {t("landing.popularCategories.podcasts")}:{" "}
                            <span className="font-bold text-foreground">
                              {item.podcastCount}
                            </span>
                          </div>

                          <div className="rounded-2xl bg-background/45 p-2">
                            {t("landing.popularCategories.youtube")}:{" "}
                            <span className="font-bold text-foreground">
                              {item.youtubeCount}
                            </span>
                          </div>
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

export default LandingPopularCategories;
