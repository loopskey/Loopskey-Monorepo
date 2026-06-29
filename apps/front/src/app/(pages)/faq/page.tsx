"use client";

import { FloatingInputField } from "@elements/floating-input";
import { useForm, useWatch } from "react-hook-form";
import { TFaqCategoryKey } from "@/types/hooks.types";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { useFaqPage } from "@hooks/useFaq";
import { GlassCard } from "@elements/glass-card";
import { useEffect } from "react";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { cn } from "@lib/utils";

import Link from "next/link";

import * as L from "lucide-react";
import * as F from "@ui/form";

const categoryIconMap: Record<TFaqCategoryKey, typeof L.HelpCircle> = {
  AI: L.Bot,
  ALL: L.HelpCircle,
  PROVIDERS: L.Users,
  CPD: L.GraduationCap,
  PLATFORM: L.ServerCog,
  SECURITY: L.ShieldCheck,
  ORGANIZATIONS: L.Building2,
  CERTIFICATIONS: L.CheckCircle2,
};

type FaqSearchValues = {
  search: string;
};

const FaqPage = () => {
  const {
    t,
    setSearch,
    categories,
    openItemId,
    toggleItem,
    resetFilters,
    filteredFaqs,
    categoryCounts,
    activeCategory,
    setActiveCategory,
    hasActiveFilters,
  } = useFaqPage();

  const searchForm = useForm<FaqSearchValues>({
    mode: "onChange",
    defaultValues: {
      search: "",
    },
  });

  const watchedSearch = useWatch({
    control: searchForm.control,
    name: "search",
  });

  useEffect(() => {
    setSearch(watchedSearch ?? "");
  }, [watchedSearch, setSearch]);

  const handleResetFilters = () => {
    searchForm.reset({
      search: "",
    });

    resetFilters();
  };

  return (
    <main className="overflow-hidden">
      <section className="relative px-4 py-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.14),transparent_32%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
              {t("faqPage.hero.eyebrow")}
            </span>

            <h1 className="mt-6 text-4xl font-medium leading-tight text-foreground md:text-6xl">
              {t("faqPage.hero.title")}{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t("faqPage.hero.highlight")}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("faqPage.hero.description")}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[330px_1fr] px-4 sm:px-6 lg:px-8">
          <aside className="space-y-5 xl:sticky xl:top-28">
            <GlassCard className="p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("faqPage.filters.title")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("faqPage.filters.description")}
                  </p>
                </div>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    size="iconSm"
                    radius="full"
                    variant="glass"
                    onClick={handleResetFilters}
                    aria-label={t("common.reset")}
                  >
                    <L.RefreshCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                {categories.map((category) => {
                  const Icon = categoryIconMap[category];
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "group flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300",
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                          : "border-glass-border bg-background/35 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {t(`faqPage.categories.${category}`)}
                      </span>
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {categoryCounts[category]}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <L.LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {t("faqPage.helpCard.title")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t("faqPage.helpCard.description")}
                  </p>
                </div>
              </div>
              <Button
                asChild
                radius="xl"
                variant="brand"
                className="mt-5 w-full"
              >
                <Link href="/contact">
                  {t("faqPage.helpCard.button")}
                  <L.ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </GlassCard>
          </aside>
          <RevealOnScroll direction="right" delay={120}>
            <div className="space-y-6">
              <GlassCard className="p-5 md:p-6">
                <F.Form {...searchForm}>
                  <form
                    className="grid gap-4 lg:grid-cols-[1fr_auto]"
                    onSubmit={(event) => event.preventDefault()}
                  >
                    <FloatingInputField
                      name="search"
                      control={searchForm.control}
                      label={t("faqPage.search.placeholder")}
                      leftIcon={<L.Search className="h-4 w-4" />}
                    />

                    <Button
                      radius="xl"
                      type="button"
                      variant="glass"
                      className="h-14"
                      onClick={handleResetFilters}
                      disabled={!hasActiveFilters}
                    >
                      <L.RefreshCcw className="h-4 w-4" />
                      {t("common.reset")}
                    </Button>
                  </form>
                </F.Form>
              </GlassCard>

              <div className="space-y-4">
                {filteredFaqs.length ? (
                  filteredFaqs.map((item, index) => {
                    const isOpen = openItemId === item.id;
                    const Icon = categoryIconMap[item.category];
                    return (
                      <RevealOnScroll
                        key={item.id}
                        delay={Math.min(index * 55, 280)}
                        direction={index % 2 === 0 ? "left" : "right"}
                      >
                        <article
                          className={cn(
                            "group overflow-hidden rounded-[2rem] border border-glass-border bg-background/55 shadow-sm backdrop-blur-xl transition-all duration-300",
                            isOpen
                              ? "border-primary/30 shadow-xl shadow-primary/5"
                              : "hover:-translate-y-1 hover:border-primary/20 hover:bg-primary/5",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className="flex w-full items-start justify-between gap-5 p-5 text-left md:p-6"
                          >
                            <div className="flex gap-4">
                              <div
                                className={cn(
                                  "mt-1 rounded-2xl p-3 transition-colors",
                                  isOpen
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-primary/10 text-primary",
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>

                              <div>
                                <Badge
                                  variant="secondary"
                                  className="rounded-full"
                                >
                                  {t(`faqPage.categories.${item.category}`)}
                                </Badge>

                                <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">
                                  {item.question}
                                </h3>
                              </div>
                            </div>

                            <L.ChevronDown
                              className={cn(
                                "mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                                isOpen && "rotate-180 text-primary",
                              )}
                            />
                          </button>

                          <div
                            className={cn(
                              "grid transition-all duration-300 ease-out",
                              isOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <div className="overflow-hidden">
                              <div className="px-5 pb-6 pl-[5.75rem] pr-6 text-sm leading-7 text-muted-foreground md:px-6 md:pb-7 md:pl-[6.25rem]">
                                {item.answer}
                              </div>
                            </div>
                          </div>
                        </article>
                      </RevealOnScroll>
                    );
                  })
                ) : (
                  <GlassCard className="p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <L.HelpCircle className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">
                      {t("faqPage.empty.title")}
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      {t("faqPage.empty.description")}
                    </p>
                    <Button
                      radius="xl"
                      type="button"
                      variant="brand"
                      className="mt-6"
                      onClick={resetFilters}
                    >
                      {t("common.reset")}
                    </Button>
                  </GlassCard>
                )}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 pb-28">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll direction="up">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-slate-600 p-8 text-white shadow-2xl md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.35),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.25),transparent_30%)]" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-xl">
                    <L.Sparkles className="h-4 w-4" />
                    {t("faqPage.cta.eyebrow")}
                  </div>

                  <h2 className="text-3xl font-extrabold md:text-4xl">
                    {t("faqPage.cta.title")}
                  </h2>

                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
                    {t("faqPage.cta.description")}
                  </p>
                </div>

                <Button
                  asChild
                  size="lg"
                  radius="xl"
                  variant="brand"
                  className="w-full lg:w-auto"
                >
                  <Link href="/contact">
                    {t("faqPage.cta.button")}
                    <L.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
};

export default FaqPage;
