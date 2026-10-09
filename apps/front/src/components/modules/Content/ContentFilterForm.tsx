"use client";

import { Loader2, RotateCcw, Search, TriangleAlert } from "lucide-react";
import { TContentFilterFormProps } from "@/types/content-module.types";
import { translateWithFallback } from "@/utils/function-helper";
import { normalizeSearchTerm } from "@/lib/content-catalog/catalog-href";
import { MAX_SEARCH_LENGTH } from "@/lib/content-catalog/catalog-href";
import { MIN_SEARCH_LENGTH } from "@/lib/content-catalog/catalog-href";
import { humanizeEnumValue } from "@/utils/function-helper";
import { buildCatalogHref } from "@/lib/content-catalog/catalog-href";
import { buttonVariants } from "@ui/button";
import { useTransition } from "react";
import { TFilterField } from "@/types/content-module.types";
import { TContentTab } from "@/types/content-module.types";
import { LinkPending } from "@elements/link-pending";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type { ChangeEvent, FormEvent } from "react";

import Link from "next/link";

const SELECT_CLASS_NAME =
  "h-12 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

const FILTER_TITLE_KEY: Record<TContentTab, string> = {
  courses: "content.filters.courseTitle",
  events: "content.filters.eventTitle",
  podcasts: "content.filters.podcastTitle",
  youtube: "content.filters.youtubeTitle",
};

const submitOnSelectChange = (event: ChangeEvent<HTMLFormElement>) => {
  if (event.target instanceof HTMLSelectElement)
    event.currentTarget.requestSubmit();
};

const readField = (data: FormData, name: string) =>
  String(data.get(name) ?? "") || undefined;

const ContentFilterForm = ({
  tab,
  values,
  facets,
  resetHref,
  retryHref,
  hasActiveFilters,
}: TContentFilterFormProps) => {
  const { t, language } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const search = normalizeSearchTerm(String(data.get("q") ?? ""));
    const href = buildCatalogHref({
      tab,
      search: search.length >= MIN_SEARCH_LENGTH ? search : undefined,
      category: readField(data, "category"),
      level: readField(data, "level"),
      rating: readField(data, "rating"),
      eventType: readField(data, "eventType"),
    });
    startTransition(() => router.push(href));
  };

  const enumLabel = (prefix: string, value: string) =>
    translateWithFallback(
      t,
      `content.enums.${prefix}.${value}`,
      humanizeEnumValue(value),
    );

  const withSelected = (
    rows: ReadonlyArray<{ value: string }>,
    selected: string,
  ) =>
    selected && !rows.some((row) => row.value === selected)
      ? [...rows, { value: selected }]
      : rows;

  const enumOptions = (
    prefix: string,
    rows: ReadonlyArray<{ value: string }>,
    selected: string,
  ) =>
    withSelected(rows, selected)
      .map((row) => ({
        value: row.value,
        label: enumLabel(prefix, row.value),
      }))
      .sort((left, right) => left.label.localeCompare(right.label, language));

  const fields: TFilterField[] = [];
  if (facets) {
    const categoryPrefix = {
      courses: "courseCategory",
      events: "eventCategory",
      podcasts: "podcastCategory",
      youtube: "youtubeCategory",
    }[tab];
    const categoryOptions = enumOptions(
      categoryPrefix,
      facets.categories,
      values.category,
    );
    if (categoryOptions.length > 0)
      fields.push({
        name: "category",
        label: t("content.filters.category"),
        value: values.category,
        options: categoryOptions,
      });

    if (tab === "courses") {
      const levelOptions = enumOptions(
        "courseLevel",
        facets.levels,
        values.level,
      );
      if (levelOptions.length > 0)
        fields.push({
          name: "level",
          label: t("content.filters.level"),
          value: values.level,
          options: levelOptions,
        });

      const ratingOptions = withSelected(
        facets.ratings.map((row) => ({ value: String(row.minimum) })),
        values.rating,
      ).map((row) => ({
        value: row.value,
        label: `${Number(row.value).toFixed(1)}+`,
      }));
      if (ratingOptions.length > 0)
        fields.push({
          name: "rating",
          label: t("content.filters.rating"),
          value: values.rating,
          options: ratingOptions,
        });
    }

    if (tab === "events") {
      const typeOptions = enumOptions(
        "eventType",
        facets.types,
        values.eventType,
      );
      if (typeOptions.length > 0)
        fields.push({
          name: "eventType",
          label: t("content.filters.eventType"),
          value: values.eventType,
          options: typeOptions,
        });
    }
  }

  const title = t(FILTER_TITLE_KEY[tab]);

  return (
    <form
      action="/content"
      method="get"
      role="search"
      onSubmit={submit}
      aria-busy={isPending}
      aria-label={title}
      onChange={submitOnSelectChange}
      key={JSON.stringify(values)}
      className="grid gap-3 lg:flex lg:items-center"
    >
      {tab !== "courses" && <input type="hidden" name="tab" value={tab} />}

      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />

        <Input
          name="q"
          type="search"
          defaultValue={values.q}
          maxLength={MAX_SEARCH_LENGTH}
          placeholder={t("content.filters.searchPlaceholder")}
          aria-label={t("content.filters.searchPlaceholder")}
          className="h-11 rounded-lg border-border/70 bg-background pl-10 shadow-none lg:h-12"
        />
      </div>

      {facets ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
          {fields.map((field) => (
            <select
              key={field.name}
              name={field.name}
              defaultValue={field.value}
              aria-label={field.label}
              className={cn(
                SELECT_CLASS_NAME,
                "lg:w-44 xl:w-52",
                field.value &&
                  "border-primary bg-primary/5 font-semibold text-primary",
              )}
            >
              <option value="">{field.label}</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      ) : (
        <>
          {Object.entries(values)
            .filter(([name, value]) => name !== "q" && value)
            .map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
          <Link
            href={retryHref}
            className="inline-flex h-12 items-center gap-2 rounded-lg border border-destructive/40 px-3 text-sm text-muted-foreground"
          >
            <TriangleAlert className="size-4 text-destructive" aria-hidden />
            {t("content.filters.optionsError")}
            <LinkPending />
          </Link>
        </>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 flex-1 lg:h-12 lg:flex-none"
        >
          {isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Search aria-hidden />
          )}
          {t("content.filters.submit")}
        </Button>

        {hasActiveFilters && (
          <Link
            href={resetHref}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-11 text-primary lg:h-12",
            )}
          >
            <RotateCcw aria-hidden />
            {t("content.filters.reset")}
            <LinkPending />
          </Link>
        )}
      </div>
    </form>
  );
};

export default ContentFilterForm;
