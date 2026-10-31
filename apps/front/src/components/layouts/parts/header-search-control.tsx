"use client";

import { THeaderSearchControlProps } from "@/types/layouts.types";
import { HEADER_SEARCH_INPUT_ID } from "@/utils/site-navigation";
import { Search, X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import dynamic from "next/dynamic";

const loadHeaderSearch = () =>
  import("@layouts/parts/header-search").then((module) => module.HeaderSearch);
const HeaderSearch = dynamic(loadHeaderSearch, { ssr: false });
const preloadHeaderSearch = () => void loadHeaderSearch();

export const HEADER_SEARCH_ROW_ID = "header-search-row";

export const HeaderSearchControl = ({
  isRowOpen,
  onToggleRow,
  isInlineActive,
  onActivateInline,
}: THeaderSearchControlProps) => {
  const { t } = useI18n();

  return (
    <>
      {isInlineActive ? (
        <HeaderSearch
          autoFocus
          variant="inline"
          className="hidden w-72 xl:block"
        />
      ) : (
        <button
          type="button"
          id={HEADER_SEARCH_INPUT_ID}
          onClick={onActivateInline}
          onFocus={preloadHeaderSearch}
          onPointerEnter={preloadHeaderSearch}
          aria-label={t("navigation.search.label")}
          className="relative hidden h-10 w-72 items-center gap-2 rounded-xl border border-border bg-muted/60 pl-3 pr-2.5 text-left text-sm font-medium text-muted-foreground outline-none transition-[border-color,background-color] hover:border-primary/25 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 xl:flex"
        >
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {t("navigation.search.placeholder")}
          </span>
          <kbd
            aria-hidden
            className="rounded-md border bg-background px-1.5 py-0.5 text-[11px] font-semibold"
          >
            /
          </kbd>
        </button>
      )}

      <Button
        size="icon"
        radius="xl"
        type="button"
        variant="ghost"
        onClick={onToggleRow}
        aria-expanded={isRowOpen}
        aria-controls={HEADER_SEARCH_ROW_ID}
        className="size-9 text-muted-foreground hover:text-primary min-[380px]:size-10 xl:hidden"
        aria-label={
          isRowOpen ? t("navigation.search.close") : t("navigation.search.open")
        }
      >
        {isRowOpen ? <X className="size-5" /> : <Search className="size-5" />}
      </Button>
    </>
  );
};

export const HeaderSearchRow = ({ onClose }: { onClose: () => void }) => (
  <HeaderSearch autoFocus variant="row" onClose={onClose} />
);
