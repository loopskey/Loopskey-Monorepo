"use client";

import { TAssociationRequirementMemberPicker } from "@/types/association-dashboard.types";
import { RequiredMark } from "@elements/required-mark";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

export const AssociationRequirementMemberPicker = ({
  label,
  search,
  options,
  onSearch,
  onChange,
  hasError,
  isLoading,
  emptyText,
  countLabel,
  placeholder,
  selectedIds,
  describedById,
  requiredText,
  loadingText,
  hasQueryError,
  errorText,
  retryText,
  onRetry,
  noResultText,
  hasMore,
  loadMoreText,
  onLoadMore,
  selectedText,
  removeLabel,
}: TAssociationRequirementMemberPicker) => {
  const listId = useId();
  const inputId = useId();
  const statusId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [options.length]);

  const selected = new Set(selectedIds);
  const isSearching = Boolean(search.trim());
  const isEmpty = options.length === 0;
  const selectedOptions = options.filter((option) =>
    selected.has(option.value),
  );

  const toggle = (value: string) =>
    onChange(
      selected.has(value)
        ? selectedIds.filter((id) => id !== value)
        : [...selectedIds, value],
    );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && options[activeIndex]) {
      event.preventDefault();
      toggle(options[activeIndex].value);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}

        {requiredText && <RequiredMark srText={requiredText} />}
      </label>

      <Input
        id={inputId}
        value={search}
        role="combobox"
        autoComplete="off"
        aria-expanded="true"
        aria-required={requiredText ? true : undefined}
        aria-controls={listId}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-describedby={[statusId, describedById].filter(Boolean).join(" ")}
        aria-invalid={hasError || hasQueryError ? "true" : undefined}
        className={cn(
          "h-11 rounded-md",
          (hasError || hasQueryError) && "border-destructive",
        )}
        aria-activedescendant={
          options[activeIndex] ? `${listId}-${activeIndex}` : undefined
        }
        onChange={(event) => onSearch(event.target.value)}
      />

      <p id={statusId} aria-live="polite" className="sr-only">
        {isLoading && loadingText
          ? loadingText
          : hasQueryError && errorText
            ? errorText
            : countLabel}
      </p>

      <ul
        id={listId}
        ref={listRef}
        role="listbox"
        aria-multiselectable="true"
        aria-label={label}
        aria-busy={isLoading || undefined}
        className="max-h-56 overflow-y-auto rounded-md border p-1"
      >
        {/* Loading, unreachable, empty roster and no-search-match each read
            differently; collapsing them would let a failed query look like an
            association with no members. */}
        {isEmpty && hasQueryError && (
          <li className="space-y-3 px-3 py-6 text-center text-sm">
            <p role="alert" className="text-destructive">
              {errorText}
            </p>

            {onRetry && retryText && (
              <Button
                radius="xl"
                size="sm"
                type="button"
                variant="outline"
                onClick={onRetry}
              >
                <L.RefreshCw className="h-4 w-4" />
                {retryText}
              </Button>
            )}
          </li>
        )}

        {isEmpty && !hasQueryError && isLoading && (
          <li className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
            <L.Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {loadingText}
          </li>
        )}

        {isEmpty && !hasQueryError && !isLoading && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {isSearching ? (noResultText ?? emptyText) : emptyText}
          </li>
        )}

        {options.map((option, index) => (
          <li
            key={option.value}
            role="option"
            data-index={index}
            id={`${listId}-${index}`}
            aria-selected={selected.has(option.value)}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm",
              index === activeIndex && "bg-primary/10",
            )}
            onClick={() => toggle(option.value)}
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{option.label}</span>

              {option.hint && (
                <span className="block truncate text-xs text-muted-foreground">
                  {option.hint}
                </span>
              )}
            </span>

            {selected.has(option.value) && (
              <L.Check className="h-4 w-4 shrink-0 text-primary" />
            )}
          </li>
        ))}

        {hasMore && onLoadMore && (
          <li className="px-1 py-2 text-center">
            <Button
              radius="xl"
              size="sm"
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onLoadMore}
            >
              {isLoading && <L.Loader2 className="h-4 w-4 animate-spin" />}
              {loadMoreText}
            </Button>
          </li>
        )}
      </ul>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{selectedText ?? selectedIds.length}</Badge>

          {/* Names rather than a bare count, so a selection made on an earlier
              page or before a search stays visible and removable. */}
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs"
            >
              {option.label}

              <button
                type="button"
                className="rounded-full p-0.5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={removeLabel?.(option.label) ?? option.label}
                onClick={() =>
                  onChange(selectedIds.filter((id) => id !== option.value))
                }
              >
                <L.X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
