"use client";

import { TaxonomyBrowser } from "@modules/ProfessionalTaxonomy/taxonomy-browser";
import { TSkillSelectorProps } from "@/types/professional-taxonomy.types";
import { useTaxonomyBrowser } from "@/hooks/useTaxonomyBrowser";
import { ProfileTaxonomyKind } from "@/lib/graphql/base";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const KEY = "professionalTaxonomy.skills";

export const SkillSelector = ({
  t,
  idPrefix,
  label,
  max,
  selected,
  onToggle,
  suggestions,
  isDisabled = false,
}: TSkillSelectorProps) => {
  const browser = useTaxonomyBrowser({
    kind: ProfileTaxonomyKind.SkillArea,
    enabled: !isDisabled,
  });

  const selectedIds = new Set(selected.map((term) => term.id));
  const isLimitReached = selected.length >= max;
  const counterId = `${idPrefix}-counter`;

  const isBlocked = (id: string) =>
    isDisabled || (!selectedIds.has(id) && isLimitReached);

  return (
    <fieldset className="space-y-4" aria-describedby={counterId}>
      <legend className="text-sm font-medium">{label}</legend>

      <p
        id={counterId}
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {isLimitReached
          ? t(`${KEY}.limitReached`, { max })
          : t(`${KEY}.counter`, { count: selected.length, max })}
      </p>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((term) => (
            <li key={term.id}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onToggle(term)}
                aria-label={t(`${KEY}.remove`, { skill: term.label })}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {term.label}
                <L.X aria-hidden className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {suggestions && !isDisabled && (
        <section
          aria-label={
            suggestions.isFallback
              ? t(`${KEY}.fallbackTitle`)
              : t(`${KEY}.suggestionsTitle`)
          }
          className="space-y-2"
        >
          <p className="text-sm font-medium text-muted-foreground">
            {suggestions.isFallback
              ? t(`${KEY}.fallbackTitle`)
              : t(`${KEY}.suggestionsTitle`)}
          </p>
          {suggestions.hasError ? (
            <div className="flex flex-col items-start gap-2 rounded-md border p-3 text-sm">
              <p role="alert" className="text-muted-foreground">
                {t(`${KEY}.suggestionsError`)}
              </p>
              <Button
                type="button"
                variant="outline"
                radius="xl"
                onClick={suggestions.onRetry}
              >
                {t("professionalTaxonomy.retry")}
              </Button>
            </div>
          ) : suggestions.isLoading ? (
            <div aria-live="polite" className="grid gap-2 sm:grid-cols-2">
              <span className="sr-only">
                {t("professionalTaxonomy.loading")}
              </span>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {suggestions.items.map((term) => {
                const isSelected = selectedIds.has(term.id);
                return (
                  <li key={term.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      disabled={isBlocked(term.id)}
                      onClick={() => onToggle(term)}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isSelected
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border hover:border-primary/40",
                        isBlocked(term.id) && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block break-words">{term.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {term.groupLabel}
                        </span>
                      </span>
                      {isSelected && (
                        <L.Check aria-hidden className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {!isDisabled && (
        <TaxonomyBrowser
          t={t}
          idPrefix={idPrefix}
          browser={browser}
          searchLabel={t(`${KEY}.search`)}
          noResultsText={t(`${KEY}.noResults`)}
          isSelected={(id) => selectedIds.has(id)}
          isBlocked={isBlocked}
          onPick={onToggle}
        />
      )}
    </fieldset>
  );
};
