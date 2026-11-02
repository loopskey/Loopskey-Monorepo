"use client";

import { useCallback, useEffect, useId } from "react";
import { useMemo, useRef, useState } from "react";
import { HEADER_SEARCH_MIN_LENGTH } from "@/hooks/useHeaderSearch";
import { HEADER_SEARCH_INPUT_ID } from "@/utils/site-navigation";
import { HeaderSearchPanel } from "@layouts/parts/header-search-panel";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useHeaderSearch } from "@/hooks/useHeaderSearch";
import { searchHrefFor } from "@layouts/parts/header-search-panel";
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

  const submit = () => {
    if (term.length < MIN_SUBMIT_LENGTH) {
      inputRef.current?.focus();
      return;
    }
    finish(term);
    router.push(localize(searchHrefFor(term)));
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
    submit();
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (rootRef.current?.contains(event.relatedTarget)) return;
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const showClear = query.length > 0;
  const isRow = variant === "row";

  return (
    <div ref={rootRef} onBlur={onBlur} className={cn("relative", className)}>
      <div className="relative">
        <L.Search
          aria-hidden
          strokeWidth={2.25}
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-primary"
        />
        <input
          value={query}
          type="search"
          ref={inputRef}
          role="combobox"
          autoComplete="off"
          enterKeyHint="search"
          aria-expanded={isOpen}
          aria-autocomplete="list"
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
            "w-full rounded-[14px] border-[1.5px] border-primary/30 bg-background pl-11 font-medium text-foreground shadow-[0_1px_2px_oklch(0.2_0.05_270/0.06),0_6px_16px_-6px_oklch(0.3351_0.1745_271.87/0.22)] outline-none transition-[border-color,box-shadow]",
            "placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/15",
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            isRow ? "h-12 pr-[4.5rem] text-[15px]" : "h-[46px] pr-28 text-sm",
          )}
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {showClear ? (
            <button
              type="button"
              aria-label={t("navigation.search.clearRecent")}
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="grid size-7 place-items-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <L.X aria-hidden className="size-4" />
            </button>
          ) : variant === "inline" ? (
            <kbd
              aria-hidden
              className="pointer-events-none rounded-md border bg-muted/50 px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground"
            >
              /
            </kbd>
          ) : null}
          <button
            type="button"
            onClick={submit}
            aria-label={t("navigation.search.submit")}
            className={cn(
              "grid shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isRow ? "size-[38px]" : "size-9",
            )}
          >
            <L.Search aria-hidden strokeWidth={2.5} className="size-[17px]" />
          </button>
        </div>
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
