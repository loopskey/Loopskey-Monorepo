"use client";

import { HEADER_SEARCH_MIN_LENGTH } from "@/hooks/useHeaderSearch";
import type { THeaderSearchPanelProps } from "@/types/layouts.types";
import { buildCatalogHref } from "@/lib/content-catalog/catalog-href";
import { cn } from "@/lib/utils";

import type { TContentCardKind } from "@/types/content-module.types";

import Link from "@elements/localized-link";

import * as L from "lucide-react";

const KIND_ICONS = {
  course: L.GraduationCap,
  event: L.CalendarDays,
  podcast: L.Headphones,
  youtube: L.MonitorPlay,
} as const;

const KIND_TEXT: Record<TContentCardKind, string> = {
  course: "text-ct-course",
  event: "text-ct-event",
  podcast: "text-ct-podcast",
  youtube: "text-ct-youtube",
};

const KIND_TINT: Record<TContentCardKind, string> = {
  course: "bg-ct-course/10 text-ct-course",
  event: "bg-ct-event/10 text-ct-event",
  podcast: "bg-ct-podcast/10 text-ct-podcast",
  youtube: "bg-ct-youtube/10 text-ct-youtube",
};

const BROWSE_TABS = [
  { tab: "courses", kind: "course" },
  { tab: "events", kind: "event" },
  { tab: "podcasts", kind: "podcast" },
  { tab: "youtube", kind: "youtube" },
] as const;

const SECTION_LABEL_CLASS_NAME =
  "px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground";

const ROW_CLASS_NAME =
  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted";

const Highlight = ({ text, term }: { text: string; term: string }) => {
  const at = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-sm bg-amber-200/70 px-px text-inherit">
        {text.slice(at, at + term.length)}
      </mark>
      {text.slice(at + term.length)}
    </>
  );
};

export const searchHrefFor = (term: string) =>
  buildCatalogHref({ tab: "courses", search: term });

export const HeaderSearchPanel = ({
  t,
  term,
  items,
  recent,
  listId,
  onPick,
  variant,
  hasError,
  isLoading,
  activeIndex,
  onClearRecent,
}: THeaderSearchPanelProps) => {
  const optionId = (index: number) => `${listId}-${index}`;
  const isActive = (index: number) => index === activeIndex;
  const hasTerm = term.length > 0;
  const isTooShort = hasTerm && term.length < HEADER_SEARCH_MIN_LENGTH;
  const showResults = term.length >= HEADER_SEARCH_MIN_LENGTH;

  return (
    <div
      id={listId}
      role="listbox"
      aria-label={t("navigation.search.results")}
      className={cn(
        "absolute top-full z-50 mt-2 max-h-[min(30rem,70vh)] overflow-y-auto rounded-2xl border bg-popover p-1.5 text-popover-foreground shadow-lg",
        "animate-in fade-in-0 slide-in-from-top-1 duration-150 motion-reduce:animate-none",
        variant === "inline"
          ? "right-0 w-[26rem] max-w-[calc(100vw-2rem)]"
          : "inset-x-0",
      )}
    >
      {!hasTerm ? (
        <>
          <p className={SECTION_LABEL_CLASS_NAME}>
            {t("navigation.search.browse")}
          </p>
          <div className="flex flex-wrap gap-1.5 px-2 pb-2">
            {BROWSE_TABS.map(({ tab, kind }) => {
              const Icon = KIND_ICONS[kind];
              return (
                <Link
                  key={tab}
                  onClick={() => onPick()}
                  href={buildCatalogHref({ tab })}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon
                    aria-hidden
                    className={cn("size-3.5", KIND_TEXT[kind])}
                  />
                  {t(`navigation.search.types.${tab}`)}
                </Link>
              );
            })}
          </div>

          {recent.length > 0 ? (
            <>
              <div className="flex items-center justify-between pr-1.5">
                <p className={SECTION_LABEL_CLASS_NAME}>
                  {t("navigation.search.recent")}
                </p>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("navigation.search.clearRecent")}
                </button>
              </div>
              {recent.map((entry, index) => (
                <Link
                  key={entry}
                  role="option"
                  id={optionId(index)}
                  aria-selected={isActive(index)}
                  onClick={() => onPick(entry)}
                  href={searchHrefFor(entry)}
                  className={cn(ROW_CLASS_NAME, isActive(index) && "bg-accent")}
                >
                  <L.Clock3
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{entry}</span>
                </Link>
              ))}
            </>
          ) : null}
        </>
      ) : null}

      {isTooShort ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">
          {t("navigation.search.minChars", { count: HEADER_SEARCH_MIN_LENGTH })}
        </p>
      ) : null}

      {showResults ? (
        <>
          <div className="flex items-center justify-between pr-2.5">
            <p className={SECTION_LABEL_CLASS_NAME}>
              {t("navigation.search.results")}
            </p>
            {isLoading ? (
              <span
                role="status"
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <L.Loader2
                  aria-hidden
                  className="size-3.5 animate-spin motion-reduce:animate-none"
                />
                {t("navigation.search.loading")}
              </span>
            ) : null}
          </div>

          {hasError ? (
            <p role="alert" className="px-3 py-4 text-sm text-muted-foreground">
              {t("navigation.search.error")}
            </p>
          ) : null}

          {!hasError && !isLoading && items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              {t("navigation.search.noResults", { query: term })}
            </p>
          ) : null}

          {items.map((item, index) => {
            const Icon = KIND_ICONS[item.kind];
            return (
              <Link
                role="option"
                key={item.id}
                href={item.href}
                id={optionId(index)}
                onClick={() => onPick()}
                aria-selected={isActive(index)}
                className={cn(ROW_CLASS_NAME, isActive(index) && "bg-accent")}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    KIND_TINT[item.kind],
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    <Highlight text={item.title} term={term} />
                  </span>
                  {item.meta ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.meta}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}

          <Link
            role="option"
            href={searchHrefFor(term)}
            id={optionId(items.length)}
            onClick={() => onPick(term)}
            aria-selected={isActive(items.length)}
            className={cn(
              ROW_CLASS_NAME,
              "mt-1 justify-between font-semibold text-primary",
              isActive(items.length) && "bg-accent",
            )}
          >
            <span className="truncate">
              {t("navigation.search.seeAll", { query: term })}
            </span>
            <L.ArrowRight aria-hidden className="size-4 shrink-0" />
          </Link>
        </>
      ) : null}
    </div>
  );
};
