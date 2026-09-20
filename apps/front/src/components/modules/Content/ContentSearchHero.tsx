"use client";

import { useI18n } from "@/hooks/useI18n";

const ContentSearchHero = () => {
  const { t } = useI18n();

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
        {t("content.hero.title")}
      </h1>
    </section>
  );
};

export default ContentSearchHero;
