"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TComboItem = { label: string; value: string };

type ComboboxProps = {
  value?: string;
  disabled?: boolean;
  emptyText?: string;
  items: TComboItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  maxHeightClassName?: string;
  onChange: (v: string) => void;
};

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled,
  emptyText = "No results found.",
  maxHeightClassName = "max-h-64",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const selected = React.useMemo(
    () => items.find((x) => x.value === value),
    [items, value],
  );

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((x) => x.label.toLowerCase().includes(query));
  }, [items, q]);

  React.useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open, q]);

  const selectItem = (item: TComboItem) => {
    onChange(item.value);
    setOpen(false);
    setQ("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) selectItem(item);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className={cn(!selected?.label && "text-muted-foreground")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-2"
        align="start"
        onKeyDown={onKeyDown}
      >
        <div className="space-y-2">
          <Input
            value={q}
            autoFocus
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
          />

          <div
            role="listbox"
            className={cn(
              "overflow-auto rounded-md border bg-background",
              maxHeightClassName,
            )}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              <ul className="p-1">
                {filtered.map((item, index) => {
                  const isSelected = item.value === value;
                  const isActive = index === activeIndex;

                  return (
                    <li key={item.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                          "hover:bg-muted",
                          isActive && "bg-muted",
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectItem(item)}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
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
  );
}
