"use client";

import { THeaderSearchRowFieldProps } from "@/types/layouts.types";
import { THeaderSearchToggleProps } from "@/types/layouts.types";
import { THeaderSearchFieldProps } from "@/types/layouts.types";
import { HEADER_SEARCH_INPUT_ID } from "@/utils/site-navigation";
import { Search, X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";

const loadHeaderSearch = () =>
  import("@layouts/parts/header-search").then((module) => module.HeaderSearch);
const HeaderSearch = dynamic(loadHeaderSearch, { ssr: false });
const preloadHeaderSearch = () => void loadHeaderSearch();

export const HEADER_SEARCH_ROW_ID = "header-search-row";

const TRIGGER_CLASS_NAME =
  "relative items-center gap-2.5 rounded-[14px] border-[1.5px] border-primary/30 bg-background pl-3.5 pr-1.5 text-left font-medium text-muted-foreground shadow-[0_1px_2px_oklch(0.2_0.05_270/0.06),0_6px_16px_-6px_oklch(0.3351_0.1745_271.87/0.22)] outline-none transition-[border-color,box-shadow] hover:border-primary/50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15";

const SubmitMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn(
      "grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground",
      className,
    )}
  >
    <Search className="size-[17px] stroke-[2.5]" />
  </span>
);

export const HeaderSearchField = ({
  isActive,
  onActivate,
}: THeaderSearchFieldProps) => {
  const { t } = useI18n();

  if (isActive)
    return (
      <HeaderSearch
        autoFocus
        variant="inline"
        className="hidden min-w-[15rem] max-w-[32.5rem] flex-1 lg:block"
      />
    );

  return (
    <button
      type="button"
      onClick={onActivate}
      id={HEADER_SEARCH_INPUT_ID}
      onFocus={preloadHeaderSearch}
      onPointerEnter={preloadHeaderSearch}
      aria-label={t("navigation.search.label")}
      className={cn(
        TRIGGER_CLASS_NAME,
        "hidden h-[46px] min-w-[15rem] max-w-[32.5rem] flex-1 text-sm lg:flex",
      )}
    >
      <Search aria-hidden className="size-[18px] shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate">
        {t("navigation.search.placeholder")}
      </span>
      <kbd
        aria-hidden
        className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[11px] font-bold"
      >
        /
      </kbd>
      <SubmitMark />
    </button>
  );
};

export const HeaderSearchToggle = ({
  isOpen,
  onToggle,
}: THeaderSearchToggleProps) => {
  const { t } = useI18n();

  return (
    <Button
      size="icon"
      radius="xl"
      type="button"
      variant="ghost"
      onClick={onToggle}
      aria-expanded={isOpen}
      onFocus={preloadHeaderSearch}
      onPointerEnter={preloadHeaderSearch}
      aria-controls={HEADER_SEARCH_ROW_ID}
      aria-label={
        isOpen ? t("navigation.search.close") : t("navigation.search.open")
      }
      className={cn(
        "size-9 min-[380px]:size-10 lg:hidden",
        isOpen
          ? "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground"
          : "text-muted-foreground hover:text-primary",
      )}
    >
      {isOpen ? <X className="size-5" /> : <Search className="size-5" />}
    </Button>
  );
};

// The row that stays under the bar on narrow screens, as wide as the screen.
export const HeaderSearchRowField = ({
  onClose,
  isActive,
  onActivate,
}: THeaderSearchRowFieldProps) => {
  const { t } = useI18n();

  return (
    <div className="border-t bg-background px-4 pb-3.5 pt-2.5 sm:px-6 lg:hidden">
      {isActive ? (
        <HeaderSearch autoFocus variant="row" onClose={onClose} />
      ) : (
        <button
          type="button"
          onClick={onActivate}
          onFocus={preloadHeaderSearch}
          onPointerEnter={preloadHeaderSearch}
          aria-label={t("navigation.search.label")}
          className={cn(TRIGGER_CLASS_NAME, "flex h-12 w-full text-[15px]")}
        >
          <Search aria-hidden className="size-[18px] shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">
            {t("navigation.search.placeholder")}
          </span>
          <SubmitMark className="size-[38px]" />
        </button>
      )}
    </div>
  );
};

export const HeaderSearchRow = ({ onClose }: { onClose: () => void }) => (
  <HeaderSearch autoFocus variant="row" onClose={onClose} />
);
