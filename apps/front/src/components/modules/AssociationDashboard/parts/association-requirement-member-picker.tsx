"use client";

import { TAssociationRequirementMemberPicker } from "@/types/association-dashboard.types";
import { useEffect, useId, useRef, useState } from "react";
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
}: TAssociationRequirementMemberPicker) => {
  const listId = useId();
  const inputId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [options.length]);

  const selected = new Set(selectedIds);

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
      </label>

      <Input
        id={inputId}
        value={search}
        role="combobox"
        autoComplete="off"
        aria-expanded="true"
        aria-controls={listId}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-describedby={describedById}
        aria-invalid={hasError ? "true" : undefined}
        className={cn("h-11 rounded-2xl", hasError && "border-destructive")}
        aria-activedescendant={
          options[activeIndex] ? `${listId}-${activeIndex}` : undefined
        }
        onChange={(event) => onSearch(event.target.value)}
      />

      <p aria-live="polite" className="sr-only">
        {isLoading ? "" : countLabel}
      </p>

      <ul
        id={listId}
        ref={listRef}
        role="listbox"
        aria-multiselectable="true"
        aria-label={label}
        className="max-h-56 overflow-y-auto rounded-2xl border border-glass-border p-1"
      >
        {options.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {emptyText}
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
      </ul>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{selectedIds.length}</Badge>
        </div>
      )}
    </div>
  );
};
