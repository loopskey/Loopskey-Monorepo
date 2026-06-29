"use client";

import { THeroSearchBoxProps } from "@/types/landing-module.types";
import { Search, Sparkles, X } from "lucide-react";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const HeroSearchBox = ({
  value,
  onChange,
  onClear,
  placeholder,
  exploreLabel,
  isExplorerOpen,
  onToggleExplorer,
}: THeroSearchBoxProps) => {
  return (
    <div
      className={cn(
        "relative rounded-[2rem] border border-glass-border bg-background/62 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl",
        "dark:shadow-[0_24px_80px_rgba(0,0,0,0.32)]",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={cn(
              "h-14 w-full rounded-2xl border border-border/60 bg-background/55 pl-12 pr-12 text-sm font-semibold outline-none backdrop-blur-xl",
              "transition-all placeholder:text-muted-foreground/70",
              "focus:border-primary/55 focus:ring-4 focus:ring-primary/15",
            )}
          />

          {value ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <Button
          size="lg"
          radius="xl"
          type="button"
          className="h-14 shrink-0"
          onClick={onToggleExplorer}
          variant={isExplorerOpen ? "brand" : "brandSoft"}
        >
          <Sparkles className="h-4 w-4" />
          {exploreLabel}
        </Button>
      </div>
    </div>
  );
};

export default HeroSearchBox;
