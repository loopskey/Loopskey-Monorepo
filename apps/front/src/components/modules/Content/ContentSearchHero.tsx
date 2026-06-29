"use client";

import { TContentSearchHeroProps } from "@/types/content-module.types";
import { Search, Sparkles } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Input } from "@ui/input";

const ContentSearchHero = ({ value, onChange }: TContentSearchHeroProps) => {
  const { t } = useI18n();

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            {t("content.hero.badge")}
          </div>

          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl lg:text-3xl">
            {t("content.hero.title")}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t("content.hero.description")}
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t("content.hero.searchPlaceholder")}
            className="h-16 rounded-[1.5rem] border-primary/20 bg-background/65 pl-14 pr-5 text-base shadow-xl backdrop-blur-xl focus-visible:ring-primary/25"
          />
        </div>
      </div>
    </GlassCard>
  );
};

export default ContentSearchHero;
