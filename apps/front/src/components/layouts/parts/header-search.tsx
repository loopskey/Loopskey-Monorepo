"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HeaderSearchPanel,
  searchHrefFor,
} from "@layouts/parts/header-search-panel";
import { HEADER_SEARCH_MIN_LENGTH } from "@/hooks/useHeaderSearch";
import { HEADER_SEARCH_INPUT_ID } from "@/utils/site-navigation";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useHeaderSearch } from "@/hooks/useHeaderSearch";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { KeyboardEvent, FocusEvent } from "react";
import type { THeaderSearchOption } from "@/types/element.types";
import type { THeaderSearchProps } from "@/types/element.types";

import * as L from "lucide-react";

const MIN_SUBMIT_LENGTH = 2;

export const HeaderSearch = ({
  variant,
  onClose,
  className,
  autoFocus = false,
}: THeaderSearchProps) => {
  const { t } = useI18n();
  const router = useRouter();
  const localize = useLocalizedHref();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const search = useHeaderSearch();
  const { term, query, setQuery, items, recent, status } = search;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const options = useMemo<THeaderSearchOption[]>(() => {
    if (term.length >= HEADER_SEARCH_MIN_LENGTH)
      return [
        ...items.map((item) => ({
          id: item.id,
          href: item.href,
          label: item.title,
        })),
        { id: "all", href: searchHrefFor(term), label: term },
      ];
    if (term.length === 0)
      return recent.map((entry) => ({
        id: entry,
        label: entry,
        href: searchHrefFor(entry),
      }));
    return [];
  }, [term, items, recent]);

  const finish = useCallback(
    (remembered?: string) => {
      if (remembered) search.remember(remembered);
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      onClose?.();
    },
    [search, onClose],
  );

  const go = (option: THeaderSearchOption) => {
    const isResult = option.id !== "all" && term.length > 0;
    finish(isResult ? undefined : option.label);
    router.push(localize(option.href));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (isOpen) setIsOpen(false);
      else onClose?.();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (options.length === 0) return;
      event.preventDefault();
      setIsOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) =>
        current === -1
          ? step === 1
            ? 0
            : options.length - 1
          : (current + step + options.length) % options.length,
      );
      return;
    }

    if (event.key !== "Enter") return;
    event.preventDefault();
    const active = options[activeIndex];
    if (active) return go(active);
    if (term.length < MIN_SUBMIT_LENGTH) return;
    finish(term);
    router.push(localize(searchHrefFor(term)));
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (rootRef.current?.contains(event.relatedTarget)) return;
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const showClear = query.length > 0;

  return (
    <div ref={rootRef} onBlur={onBlur} className={cn("relative", className)}>
      <div className="relative">
        <L.Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          value={query}
          type="search"
          role="combobox"
          autoComplete="off"
          enterKeyHint="search"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          aria-label={t("navigation.search.label")}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
          id={variant === "inline" ? HEADER_SEARCH_INPUT_ID : undefined}
          placeholder={t("navigation.search.placeholder")}
          onKeyDown={onKeyDown}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          className={cn(
            "h-10 w-full rounded-xl border border-border bg-muted/60 pl-9 text-sm font-medium text-foreground outline-none transition-[border-color,background-color,box-shadow]",
            "placeholder:text-muted-foreground hover:border-primary/25 focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15",
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            variant === "inline" ? "pr-10" : "pr-9",
          )}
        />
        {showClear ? (
          <button
            type="button"
            aria-label={t("navigation.search.clearRecent")}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <L.X aria-hidden className="size-4" />
          </button>
        ) : variant === "inline" ? (
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border bg-background px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
          >
            /
          </kbd>
        ) : null}
      </div>

      {isOpen ? (
        <div onMouseDown={(event) => event.preventDefault()}>
          <HeaderSearchPanel
            t={t}
            term={term}
            items={items}
            listId={listId}
            recent={recent}
            variant={variant}
            activeIndex={activeIndex}
            hasError={status === "error"}
            isLoading={status === "loading"}
            onClearRecent={search.clearRecent}
            onPick={(remembered) => finish(remembered)}
          />
        </div>
      ) : null}
    </div>
  );
};
