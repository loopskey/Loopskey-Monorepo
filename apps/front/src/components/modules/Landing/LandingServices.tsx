"use client";

import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import * as L from "lucide-react";

const LandingServices = () => {
  const { t } = useI18n();

  const services = [
    { icon: L.ClipboardCheck, key: "cpdManagement" },
    { icon: L.Globe2, key: "contentAggregation" },
    { icon: L.UserRoundCog, key: "personalizedDashboard" },
    { icon: L.Network, key: "professionalsConnection" },
    { icon: L.BrainCircuit, key: "recommendations" },
    { icon: L.Compass, key: "providerSolutions" },
    { icon: L.BriefcaseBusiness, key: "hrAssociations" },
    { icon: L.BarChart3, key: "dataAnalytics" },
  ];

  return (
    <section className="relative overflow-x-clip px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll direction="up">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/60 px-4 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur-xl">
              {t("landing.services.badge")}
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("landing.services.title")}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {t("landing.services.subtitle")}
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <RevealOnScroll
                key={service.key}
                delay={index * 80}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <GlassCard className="group h-full p-6" glow={false}>
                  <div className="relative z-10">
                    <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-bold">
                      {t(`landing.services.items.${service.key}.title`)}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {t(`landing.services.items.${service.key}.text`)}
                    </p>
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

export default LandingServices;
