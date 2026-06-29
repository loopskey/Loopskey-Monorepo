"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Check, X } from "lucide-react";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import * as React from "react";

export type TMemberOption = {
  sub?: string;
  label: string;
  userId: string;
};

type MultiMemberSelectProps = {
  disabled?: boolean;
  emptyText?: string;
  placeholder?: string;
  selectedIds: string[];
  items: TMemberOption[];
  searchPlaceholder?: string;
  maxHeightClassName?: string;
  onChange: (ids: string[]) => void;
};

export function MultiMemberSelect({
  items,
  selectedIds,
  onChange,
  disabled,
  placeholder = "Select members...",
  searchPlaceholder = "Search members...",
  emptyText = "No members found.",
  maxHeightClassName = "max-h-72",
}: MultiMemberSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedItems = React.useMemo(
    () => items.filter((x) => selectedSet.has(x.userId)),
    [items, selectedSet],
  );

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((x) => {
      const hay = `${x.label} ${x.sub ?? ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, q]);

  React.useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open, q]);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
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
      if (item) toggle(item.userId);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            disabled={disabled}
            variant="outline"
            className="w-full justify-between"
          >
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : placeholder}
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
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
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
                  {filtered.map((m, index) => {
                    const isSelected = selectedSet.has(m.userId);
                    const isActive = index === activeIndex;

                    return (
                      <li key={m.userId}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                            "hover:bg-muted",
                            isActive && "bg-muted",
                          )}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => toggle(m.userId)}
                        >
                          <Check
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />

                          <div className="flex min-w-0 flex-col">
                            <span className="truncate">{m.label}</span>
                            {m.sub && (
                              <span className="truncate text-xs text-muted-foreground">
                                {m.sub}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedItems.slice(0, 6).map((m) => (
                  <Badge key={m.userId} variant="secondary" className="gap-2">
                    <span className="max-w-[220px] truncate">{m.label}</span>
                    <button
                      type="button"
                      className="opacity-70 hover:opacity-100"
                      onClick={() =>
                        onChange(selectedIds.filter((x) => x !== m.userId))
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}

                {selectedItems.length > 6 && (
                  <Badge variant="outline">+{selectedItems.length - 6}</Badge>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
