"use client";

import { TContentSearchHeroProps } from "@/types/content-module.types";
import { TContentTab } from "@/types/content-module.types";
import { useI18n } from "@/hooks/useI18n";

const COUNT_KEY: Record<TContentTab, string> = {
  courses: "content.hero.count.courses",
  events: "content.hero.count.events",
  podcasts: "content.hero.count.podcasts",
  youtube: "content.hero.count.youtube",
};

const ContentSearchHero = ({
  activeTab,
  totalCount,
}: TContentSearchHeroProps) => {
  const { t, language } = useI18n();

  return (
    <section className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
        {t("content.hero.title")}
      </h1>

      <p
        aria-live="polite"
        className="min-h-5 text-sm tabular-nums text-muted-foreground"
      >
        {typeof totalCount === "number" &&
          t(COUNT_KEY[activeTab], {
            count: new Intl.NumberFormat(language).format(totalCount),
          })}
      </p>
    </section>
  );
};

export default ContentSearchHero;
