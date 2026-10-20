"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useLandingFeatured } from "@/hooks/useLandingFeatured";
import { getNextLandingKind } from "@/utils/landing-shelf.constant";
import { cn } from "@/lib/utils";

import LandingContentSkeleton from "@modules/Landing/parts/LandingContentSkeleton";
import LandingEmptyState from "@modules/Landing/parts/LandingEmptyState";
import LearningHubTabs from "@modules/Landing/parts/LearningHubTabs";
import LearningShelf from "@modules/Landing/parts/LearningShelf";
import Link from "@elements/localized-link";

const LandingFeatured = () => {
  const {
    t,
    tabs,
    items,
    isError,
    refetch,
    activeTab,
    totalCount,
    isLoading,
    selectTab,
    viewAllHref,
    goToNextTab,
  } = useLandingFeatured();

  const nextTabValue = getNextLandingKind(activeTab);
  const nextTabLabel = tabs.find((tab) => tab.value === nextTabValue)?.label;

  return (
    <section className="relative overflow-x-clip px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-primary">
              <Sparkles className="size-3.5" />
              {t("landing.learningHub.badge")}
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {t("landing.learningHub.title")}
            </h2>

            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {t("landing.learningHub.subtitle")}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:items-end">
            <LearningHubTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={selectTab}
            />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {typeof totalCount === "number" ? (
                <p className="text-sm font-semibold text-muted-foreground">
                  {t("landing.learningHub.totalAvailable", {
                    count: totalCount,
                  })}
                </p>
              ) : null}

              <Link
                href={viewAllHref}
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary"
              >
                {t("landing.learningHub.viewAll")}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <div
          key={activeTab}
          className={cn(
            "mt-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
          )}
        >
          {isLoading ? (
            <LandingContentSkeleton />
          ) : isError && !items.length ? (
            <LandingEmptyState variant="error" onRetry={() => void refetch()} />
          ) : !items.length ? (
            <LandingEmptyState />
          ) : (
            <LearningShelf
              items={items}
              nextTabLabel={nextTabLabel ?? ""}
              onSequenceEnd={goToNextTab}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatured;
