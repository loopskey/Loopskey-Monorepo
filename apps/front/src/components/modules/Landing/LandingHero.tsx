"use client";

import { useLandingHeroSearch } from "@/hooks/useLandingHero";
import { siteLinks } from "@/utils/site-navigation";
import { GlassCard } from "@elements/glass-card";

import HeroMiniResultSkeleton from "@modules/Landing/parts/HeroMiniResultSkeleton";
import HeroCategoryExplorer from "@modules/Landing/parts/HeroCategoryExplorer";
import HeroMiniResultCard from "@modules/Landing/parts/HeroMiniResultCard";
import LandingActionGroup from "./parts/LandingActionGroup";
import HeroSearchBox from "@modules/Landing/parts/HeroSearchBox";
import Image from "next/image";
import Link from "@elements/localized-link";

const TITLE_ID = "landing-hero-title";

const LandingHero = () => {
  const {
    t,
    search,
    results,
    isLoading,
    hasSearch,
    setSearch,
    categories,
    clearSearch,
    clearCategory,
    selectCategory,
    isExplorerOpen,
    selectedCategory,
    setIsExplorerOpen,
    hasSelectedCategory,
  } = useLandingHeroSearch();

  const shouldShowResults = hasSearch || hasSelectedCategory;

  return (
    <section
      aria-labelledby={TITLE_ID}
      className="relative overflow-x-clip bg-[radial-gradient(ellipse_at_top_right,var(--color-accent),transparent_55%)]"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8 lg:pb-16 lg:pt-16">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-accent/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {t("landing.hero.badge")}
          </p>

          <h1
            id={TITLE_ID}
            className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            <span className="block text-brand-sky-large-text">
              {t("landing.hero.titleLine1")}
            </span>{" "}
            <span className="block text-brand-navy">
              {t("landing.hero.titleLine2")}
            </span>{" "}
            <span className="block text-brand-orange-large-text">
              {t("landing.hero.titleLine3")}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("landing.hero.subtitle")}
          </p>

          <LandingActionGroup
            size="xl"
            className="mt-8"
            actions={[
              {
                kind: "session",
                key: "account",
                intent: "account",
                variant: "primary",
                withArrow: true,
              },
              {
                kind: "link",
                key: "explore",
                href: siteLinks.content,
                label: t("landing.hero.exploreLearning"),
                variant: "outline",
              },
            ]}
          />

          <div className="mt-8 max-w-2xl space-y-4">
            <HeroSearchBox
              value={search}
              onChange={setSearch}
              onClear={clearSearch}
              isExplorerOpen={isExplorerOpen}
              clearLabel={t("landing.hero.clear")}
              exploreLabel={t("landing.hero.exploreButton")}
              placeholder={t("landing.hero.searchPlaceholder")}
              onToggleExplorer={() => setIsExplorerOpen(!isExplorerOpen)}
            />

            {isExplorerOpen ? (
              <GlassCard className="p-5" glow={false}>
                <div className="relative z-10">
                  <HeroCategoryExplorer
                    categories={categories}
                    onSelect={selectCategory}
                    selectedCategory={selectedCategory}
                  />
                </div>
              </GlassCard>
            ) : null}

            {selectedCategory ? (
              <div className="flex items-center justify-between rounded-md border px-4 py-3 text-sm">
                <span className="font-medium text-muted-foreground">
                  {t("landing.hero.selectedCategory")}:{" "}
                  <span className="text-primary">{selectedCategory.label}</span>
                </span>

                <button
                  type="button"
                  onClick={clearCategory}
                  className="font-medium text-primary hover:underline"
                >
                  {t("landing.hero.clear")}
                </button>
              </div>
            ) : null}

            {shouldShowResults ? (
              <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {hasSearch
                      ? t("landing.hero.searchResults")
                      : t("landing.hero.categoryResults")}
                  </h2>

                  <Link
                    href={siteLinks.content}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("landing.hero.viewAll")}
                  </Link>
                </div>

                {isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <HeroMiniResultSkeleton key={index} />
                    ))}
                  </div>
                ) : results.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {results.map((item) => (
                      <HeroMiniResultCard
                        item={item}
                        key={`${item.kind}-${item.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <GlassCard className="p-5" glow={false}>
                    <p className="relative z-10 text-sm font-medium text-muted-foreground">
                      {t("landing.hero.noResults")}
                    </p>
                  </GlassCard>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="relative aspect-[600/638] w-full">
            <Image
              fill
              alt=""
              priority
              src="/hero.png"
              className="object-contain"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 512px, 576px"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
