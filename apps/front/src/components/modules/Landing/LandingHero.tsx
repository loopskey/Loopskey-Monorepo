"use client";

import { HERO_SPLIT_DURATION_S, HERO_SPLIT_STAGGER_MS } from "@utils/constant";
import { SplitText, countChars } from "@elements/split-text";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLandingHeroSearch } from "@/hooks/useLandingHero";
import { useAuthSession } from "@/hooks/useAuthSession";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import HeroMiniResultSkeleton from "@modules/Landing/parts/HeroMiniResultSkeleton";
import HeroCategoryExplorer from "@modules/Landing/parts/HeroCategoryExplorer";
import HeroMiniResultCard from "@modules/Landing/parts/HeroMiniResultCard";
import HeroSearchBox from "@modules/Landing/parts/HeroSearchBox";
import Image from "next/image";
import Link from "next/link";

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

  const { isAuthenticated, dashboardHref } = useAuthSession();

  const shouldShowResults = hasSearch || hasSelectedCategory;

  // Each line is its own SplitText, so the following lines are offset by the
  // characters ahead of them to keep one continuous reveal in every locale.
  const titleLine1 = t("landing.hero.titleLine1");
  const titleLine2 = t("landing.hero.titleLine2");
  const titleLine3 = t("landing.hero.titleLine3");

  const line2StartDelay = countChars(titleLine1) * HERO_SPLIT_STAGGER_MS;
  const line3StartDelay =
    line2StartDelay + countChars(titleLine2) * HERO_SPLIT_STAGGER_MS;

  return (
    <section className="relative overflow-x-clip px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/14 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in-0 slide-in-from-bottom-5 duration-700">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/60 px-4 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            {t("landing.hero.badge")}
          </div>

          <h1 className="max-w-4xl text-3xl font-bold leading-[1.5] tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl">
            <SplitText
              tag="span"
              text={titleLine1}
              textAlign="left"
              className="block"
              delay={HERO_SPLIT_STAGGER_MS}
              duration={HERO_SPLIT_DURATION_S}
            />
            <SplitText
              inheritGradient
              tag="span"
              text={titleLine2}
              textAlign="left"
              startDelay={line2StartDelay}
              delay={HERO_SPLIT_STAGGER_MS}
              duration={HERO_SPLIT_DURATION_S}
              className="block bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent"
            />
            <SplitText
              tag="span"
              text={titleLine3}
              textAlign="left"
              className="block"
              startDelay={line3StartDelay}
              delay={HERO_SPLIT_STAGGER_MS}
              duration={HERO_SPLIT_DURATION_S}
            />
          </h1>

          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-muted-foreground sm:text-lg">
            {t("landing.hero.subtitleLine1")}
            <span className="block text-foreground">
              {t("landing.hero.subtitleLine2")}
            </span>
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl" radius="xl" variant="brand">
              <Link href="/content">
                {t("landing.hero.primaryCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            {isAuthenticated ? (
              dashboardHref ? (
                <Button asChild size="xl" radius="xl" variant="glass">
                  <Link href={dashboardHref}>
                    {t("landing.hero.dashboardCta")}
                  </Link>
                </Button>
              ) : null
            ) : (
              <Button asChild size="xl" radius="xl" variant="glass">
                <Link href="/auth/professional">
                  {t("landing.hero.secondaryCta")}
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-8 max-w-3xl space-y-4">
            <HeroSearchBox
              value={search}
              onChange={setSearch}
              onClear={clearSearch}
              isExplorerOpen={isExplorerOpen}
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
              <div className="flex items-center justify-between rounded-2xl border border-glass-border bg-background/50 px-4 py-3 text-sm backdrop-blur-xl">
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
              <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {hasSearch
                      ? t("landing.hero.searchResults")
                      : t("landing.hero.categoryResults")}
                  </h2>

                  <Link
                    href="/content"
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

        <div className="relative animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-6 duration-700 lg:min-h-[620px]">
          <div className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto flex max-w-xl items-center justify-center [perspective:1400px]">
            <div className="relative h-[420px] w-full sm:h-[520px] animate-[hero-float_5s_ease-in-out_infinite] transition-transform duration-700 lg:[transform:rotateY(-8deg)] lg:hover:[transform:rotateY(0deg)_scale(1.03)]">
              <Image
                fill
                priority
                src="/hero.png"
                alt="LoopsKey professional learning"
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-contain drop-shadow-[0_35px_80px_rgba(37,99,235,0.22)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
