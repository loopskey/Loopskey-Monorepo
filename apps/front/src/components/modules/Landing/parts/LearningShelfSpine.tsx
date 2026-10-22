"use client";

import { ContentThumbnail } from "@elements/content-thumbnail";
import { LANDING_SHELF_KIND_DOT_CLASS_NAME } from "@/utils/landing-shelf.constant";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { TLearningShelfSpineProps } from "@/types/landing-module.types";

const LearningShelfSpine = ({
  item,
  index,
  isActive,
  onSelect,
}: TLearningShelfSpineProps) => {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={t("landing.learningHub.shelf.show", { title: item.title })}
      className={cn(
        "flex h-full min-w-0 flex-1 flex-col items-center overflow-hidden rounded-2xl border pb-3 outline-none",
        "transition-[transform,background-color,border-color,box-shadow,color] duration-500 ease-out",
        "focus-visible:ring-[3px] focus-visible:ring-ring/35",
        "xl:w-16 xl:flex-none",
        isActive
          ? "-translate-y-2.5 border-primary bg-primary text-primary-foreground shadow-lg"
          : "bg-card text-foreground hover:-translate-y-1.5 hover:border-primary/50",
      )}
    >
      <span className="relative block h-10 w-full shrink-0 overflow-hidden bg-muted xl:h-24">
        <ContentThumbnail
          kind={item.kind}
          title=""
          imageUrl={item.imageUrl}
          category={item.categoryKey}
          sizes="64px"
        />
      </span>

      <span
        aria-hidden
        className={cn(
          "mt-2 font-mono text-xs xl:mt-3",
          isActive ? "text-primary-foreground/75" : "text-muted-foreground",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <span
        aria-hidden
        className="mb-3 mt-2 min-h-0 flex-1 rotate-180 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold [writing-mode:vertical-rl] xl:my-3 xl:text-sm"
      >
        {item.title}
      </span>

      <span
        aria-hidden
        className={cn(
          "size-2.5 shrink-0 rounded-full ring-2 ring-background/90",
          LANDING_SHELF_KIND_DOT_CLASS_NAME[item.kind],
        )}
      />
    </button>
  );
};

export default LearningShelfSpine;
