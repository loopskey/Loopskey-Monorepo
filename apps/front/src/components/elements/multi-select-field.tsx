"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { TMultiSelectFieldProps } from "@/types/element.types";
import { TMultiSelectItem } from "@/types/element.types";
import { FieldValues } from "react-hook-form";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import * as React from "react";
import * as F from "@ui/form";

export const MultiSelectField = <T extends FieldValues>({
  name,
  label,
  items,
  control,
  onRetry,
  disabled,
  hasError,
  className,
  emptyText,
  errorText,
  retryText,
  isLoading,
  description,
  loadingText,
  placeholder,
  removeLabel,
  searchPlaceholder,
}: TMultiSelectFieldProps<T>) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;
    return items.filter((item) =>
      `${item.label} ${item.groupLabel ?? ""}`.toLowerCase().includes(search),
    );
  }, [items, query]);

  React.useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open, query]);

  return (
    <F.FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedIds: string[] = Array.isArray(field.value)
          ? (field.value as string[])
          : [];
        const selectedSet = new Set(selectedIds);
        const selectedItems = items.filter((item) =>
          selectedSet.has(item.value),
        );

        const toggle = (item: TMultiSelectItem) => {
          const next = selectedSet.has(item.value)
            ? selectedIds.filter((id) => id !== item.value)
            : [...selectedIds, item.value];
          field.onChange(next);
        };

        const remove = (value: string) => {
          field.onChange(selectedIds.filter((id) => id !== value));
        };

        const onKeyDown = (event: React.KeyboardEvent) => {
          if (!open) return;
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) =>
              Math.min(index + 1, Math.max(filtered.length - 1, 0)),
            );
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const item = filtered[activeIndex];
            if (item) toggle(item);
          }
        };

        const isDisabled = disabled || isLoading || hasError;

        return (
          <F.FormItem className={cn("space-y-2", className)}>
            <F.FormLabel className="text-sm font-medium text-foreground/90">
              {label}
            </F.FormLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <F.FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isDisabled}
                    aria-invalid={Boolean(fieldState.error)}
                    className="h-12 w-full justify-between rounded-2xl border-border/70 bg-background/70 backdrop-blur-xl"
                  >
                    <span
                      className={cn(
                        "truncate",
                        !selectedItems.length && "text-muted-foreground",
                      )}
                    >
                      {isLoading
                        ? loadingText
                        : selectedItems.length
                          ? `${selectedItems.length} ${label}`
                          : placeholder}
                    </span>
                    {isLoading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-60" />
                    ) : (
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                    )}
                  </Button>
                </F.FormControl>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                onKeyDown={onKeyDown}
                className="z-[9999] w-[--radix-popover-trigger-width] p-2"
              >
                <div className="space-y-2">
                  <Input
                    autoFocus
                    value={query}
                    placeholder={searchPlaceholder}
                    onChange={(event) => setQuery(event.target.value)}
                  />

                  <div
                    role="listbox"
                    aria-multiselectable
                    aria-label={label}
                    className="max-h-64 overflow-auto rounded-md border bg-background"
                  >
                    {filtered.length === 0 ? (
                      <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                        {emptyText}
                      </p>
                    ) : (
                      <ul className="p-1">
                        {filtered.map((item, index) => {
                          const isSelected = selectedSet.has(item.value);
                          const isActive = index === activeIndex;
                          const showGroup =
                            item.groupLabel &&
                            item.groupLabel !== filtered[index - 1]?.groupLabel;

                          return (
                            <li key={item.value}>
                              {showGroup ? (
                                <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  {item.groupLabel}
                                </p>
                              ) : null}

                              <button
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => toggle(item)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                                  "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                                  isActive && "bg-muted",
                                )}
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    isSelected ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <span className="truncate">{item.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {hasError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <span>{errorText}</span>
                {onRetry ? (
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={onRetry}
                    className="h-auto px-2 py-1"
                  >
                    {retryText}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {selectedItems.length > 0 ? (
              <ul className="flex flex-wrap gap-2 pt-1">
                {selectedItems.map((item) => (
                  <li key={item.value}>
                    <Badge
                      variant="secondary"
                      className="gap-1 rounded-full py-1 pl-3 pr-1"
                    >
                      {item.label}
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => remove(item.value)}
                        aria-label={`${removeLabel}: ${item.label}`}
                        className="rounded-full p-0.5 transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}

            {description ? (
              <F.FormDescription>{description}</F.FormDescription>
            ) : null}
            <F.FormMessage />
          </F.FormItem>
        );
      }}
    />
  );
};
