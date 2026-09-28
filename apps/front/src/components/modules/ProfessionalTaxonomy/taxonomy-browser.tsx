"use client";

import { TTaxonomyBrowserProps } from "@/types/professional-taxonomy.types";
import { TTaxonomyTerm } from "@/types/professional-taxonomy.types";
import { TTaxonomyPage } from "@/types/professional-taxonomy.types";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const KEY = "professionalTaxonomy";

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlighted = ({ text, term }: { text: string; term: string }) => {
  if (!term) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "i"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={index}
            className="rounded-sm bg-primary/15 px-0.5 font-semibold text-foreground"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};

const TermButton = ({
  term,
  highlight,
  showGroup,
  isSelected,
  isBlocked,
  onPick,
}: {
  term: TTaxonomyTerm;
  highlight: string;
  showGroup: boolean;
  isSelected: boolean;
  isBlocked: boolean;
  onPick: (term: TTaxonomyTerm) => void;
}) => (
  <li>
    <button
      type="button"
      aria-pressed={isSelected}
      disabled={isBlocked}
      onClick={() => onPick(term)}
      className={cn(
        "flex min-h-11 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/10 font-medium"
          : "border-border hover:border-primary/40",
        isBlocked && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="min-w-0">
        <span className="block break-words">
          <Highlighted text={term.label} term={highlight} />
        </span>
        {showGroup && (
          <span className="block truncate text-xs text-muted-foreground">
            {term.groupLabel}
          </span>
        )}
      </span>
      {isSelected && <L.Check aria-hidden className="h-4 w-4 shrink-0" />}
    </button>
  </li>
);

const PageBody = ({
  t,
  page,
  highlight,
  showGroup,
  emptyText,
  isSelected,
  isBlocked,
  onPick,
  onMore,
  onRetry,
}: {
  t: TTaxonomyBrowserProps["t"];
  page: TTaxonomyPage;
  highlight: string;
  showGroup: boolean;
  emptyText: string;
  isSelected: (id: string) => boolean;
  isBlocked: (id: string) => boolean;
  onPick: (term: TTaxonomyTerm) => void;
  onMore: () => void;
  onRetry: () => void;
}) => {
  if (page.status === "loading")
    return (
      <div aria-live="polite" className="grid gap-2 sm:grid-cols-2">
        <span className="sr-only">{t(`${KEY}.loading`)}</span>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full rounded-md" />
        ))}
      </div>
    );

  if (page.status === "error" && !page.items.length)
    return (
      <div className="flex flex-col items-start gap-2 rounded-md border p-3 text-sm">
        <p role="alert" className="text-muted-foreground">
          {t(`${KEY}.termsError`)}
        </p>
        <Button type="button" variant="outline" radius="xl" onClick={onRetry}>
          {t(`${KEY}.retry`)}
        </Button>
      </div>
    );

  if (!page.items.length)
    return (
      <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
        {emptyText}
      </p>
    );

  return (
    <div className="space-y-2">
      <ul className="grid gap-2 sm:grid-cols-2">
        {page.items.map((term) => (
          <TermButton
            key={term.id}
            term={term}
            highlight={highlight}
            showGroup={showGroup}
            isSelected={isSelected(term.id)}
            isBlocked={isBlocked(term.id)}
            onPick={onPick}
          />
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {t(`${KEY}.showing`, {
            shown: page.items.length,
            total: page.totalCount,
          })}
        </p>
        {page.status === "error" ? (
          <Button type="button" variant="outline" radius="xl" onClick={onRetry}>
            {t(`${KEY}.retry`)}
          </Button>
        ) : page.nextCursor ? (
          <Button
            type="button"
            variant="outline"
            radius="xl"
            onClick={onMore}
            disabled={page.status === "loadingMore"}
          >
            {page.status === "loadingMore" && (
              <L.Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            )}
            {t(`${KEY}.loadMore`)}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export const TaxonomyBrowser = ({
  t,
  idPrefix,
  browser,
  isSelected,
  isBlocked = () => false,
  onPick,
  searchLabel,
  noResultsText,
}: TTaxonomyBrowserProps) => {
  const searchId = `${idPrefix}-search`;
  const hintId = `${idPrefix}-search-hint`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={searchId}>{searchLabel}</Label>
        <div className="relative">
          <L.Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={searchId}
            type="search"
            className="pl-9"
            value={browser.query}
            aria-describedby={hintId}
            placeholder={searchLabel}
            onChange={(event) => browser.setQuery(event.target.value)}
          />
        </div>
        <p id={hintId} className="text-xs text-muted-foreground">
          {browser.isSearchTooShort
            ? t(`${KEY}.tooShort`)
            : t(`${KEY}.searchHint`)}
        </p>
      </div>

      {browser.isSearchActive && browser.searchPage ? (
        <section aria-label={t(`${KEY}.searchResults`)} className="space-y-2">
          <PageBody
            t={t}
            showGroup
            page={browser.searchPage}
            highlight={browser.searchTerm}
            emptyText={noResultsText}
            isSelected={isSelected}
            isBlocked={isBlocked}
            onPick={onPick}
            onMore={browser.loadMoreSearch}
            onRetry={browser.retrySearch}
          />
        </section>
      ) : (
        <section aria-label={t(`${KEY}.categories`)} className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t(`${KEY}.categories`)}
          </p>
          {browser.hasCategoriesError ? (
            <div className="flex flex-col items-start gap-2 rounded-md border p-3 text-sm">
              <p role="alert" className="text-muted-foreground">
                {t(`${KEY}.categoriesError`)}
              </p>
              <Button
                type="button"
                variant="outline"
                radius="xl"
                onClick={() => void browser.retryCategories()}
              >
                {t(`${KEY}.retry`)}
              </Button>
            </div>
          ) : browser.isCategoriesLoading ? (
            <div aria-live="polite" className="space-y-2">
              <span className="sr-only">{t(`${KEY}.loading`)}</span>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <ul className="divide-y rounded-md border">
              {browser.categories.map((category) => {
                const isOpen = browser.expandedKey === category.key;
                const panelId = `${idPrefix}-category-${category.key}`;
                const page = browser.pages[category.key];
                return (
                  <li key={category.key}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => browser.toggleCategory(category.key)}
                      className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    >
                      <span className="min-w-0 break-words font-medium">
                        {category.label}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        {t(`${KEY}.termCount`, { count: category.termCount })}
                        <L.ChevronDown
                          aria-hidden
                          className={cn(
                            "h-4 w-4 transition-transform motion-reduce:transition-none",
                            isOpen && "rotate-180",
                          )}
                        />
                      </span>
                    </button>
                    {isOpen && (
                      <div id={panelId} className="px-3 pb-3 pt-1">
                        {page && (
                          <PageBody
                            t={t}
                            page={page}
                            highlight=""
                            showGroup={false}
                            emptyText={noResultsText}
                            isSelected={isSelected}
                            isBlocked={isBlocked}
                            onPick={onPick}
                            onMore={() =>
                              browser.loadMoreCategory(category.key)
                            }
                            onRetry={() => browser.retryCategory(category.key)}
                          />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};
