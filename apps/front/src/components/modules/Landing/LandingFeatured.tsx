"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useLandingFeatured } from "@/hooks/useLandingFeatured";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import LandingContentSkeleton from "@modules/Landing/parts/LandingContentSkeleton";
import LandingContentCarousel from "@modules/Landing/parts/LandingContentCarousel";
import SpotlightContentCard from "@modules/Landing/parts/SpotlightContentCard";
import LandingEmptyState from "@modules/Landing/parts/LandingEmptyState";
import LearningHubTabs from "@modules/Landing/parts/LearningHubTabs";
import Link from "next/link";

const LandingFeatured = () => {
  const {
    t,
    tabs,
    items,
    spotlight,
    activeTab,
    totalCount,
    isLoading,
    viewAllHref,
    setActiveTab,
    setHoveredItemId,
  } = useLandingFeatured();

  return (
    <section className="relative overflow-x-clip px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/60 px-4 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            {t("landing.learningHub.badge")}
          </div>

          {/* Title */}
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("landing.learningHub.title")}
          </h2>

          {/* Subtitle */}
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t("landing.learningHub.subtitle")}
          </p>

          {/* Total count */}
          {typeof totalCount === "number" && (
            <p className="text-sm font-semibold text-primary">
              {t("landing.learningHub.totalAvailable", {
                count: totalCount,
              })}
            </p>
          )}

          {/* Button */}
          <Button
            asChild
            variant="brandSoft"
            radius="xl"
            size="lg"
            className="mt-4"
          >
            <Link href={viewAllHref} className="inline-flex items-center gap-2">
              {t("landing.learningHub.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <LearningHubTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div
          key={activeTab}
          className={cn(
            "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
          )}
        >
          {isLoading ? (
            <LandingContentSkeleton />
          ) : !items.length || !spotlight ? (
            <LandingEmptyState />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="min-w-0">
                <SpotlightContentCard item={spotlight} />
              </div>

              <div className="min-w-0">
                <LandingContentCarousel
                  items={items}
                  activeItemId={spotlight.id}
                  onItemHover={(item) => setHoveredItemId(item.id)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatured;
