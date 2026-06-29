"use client";

import { THeroCategoryExplorerProps } from "@/types/landing-module.types";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

const HeroCategoryExplorer = ({
  onSelect,
  categories,
  selectedCategory,
}: THeroCategoryExplorerProps) => {
  const { t } = useI18n();

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {t("landing.hero.exploreTitle")}
      </p>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = selectedCategory?.id === category.id;

          return (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelect(category)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300",
                "hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-lg"
                  : "border-glass-border bg-background/55 text-muted-foreground backdrop-blur-xl",
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HeroCategoryExplorer;
