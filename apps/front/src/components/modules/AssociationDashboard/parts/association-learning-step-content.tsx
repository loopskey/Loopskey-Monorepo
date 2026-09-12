"use client";

import { TAssociationLearningStepContent } from "@/types/association-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingInputField } from "@elements/floating-input";
import { humanizeEnumValue } from "@utils/function-helper";
import { ContentType } from "@/lib/graphql/base";
import { Skeleton } from "@ui/skeleton";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import * as S from "@ui/select";
import * as L from "lucide-react";

const ALL = "ALL";

const CONTENT_TYPES = [
  ALL,
  ContentType.Course,
  ContentType.Event,
  ContentType.Podcast,
  ContentType.Youtube,
] as const;

export const AssociationLearningStepContent = ({
  hook,
}: TAssociationLearningStepContent) => {
  const {
    t,
    form,
    isExternal,
    catalogType,
    catalogSearch,
    catalogResults,
    setCatalogType,
    pickCatalogItem,
    setCatalogSearch,
    isCatalogLoading,
    selectedContentId,
  } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.editor.${key}`);

  return (
    <div className="space-y-4">
      {isExternal ? (
        <>
          <FloatingInputField
            name="externalTitle"
            control={form.control}
            label={label("title")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingInputField
              name="externalProvider"
              control={form.control}
              label={label("provider")}
            />

            <FloatingInputField
              name="externalUrl"
              control={form.control}
              label={label("url")}
            />
          </div>
        </>
      ) : (
        <div>
          <p className="text-xs uppercase text-muted-foreground">
            {label("pickContent")}
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <div className="relative min-w-0 flex-1">
              <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={catalogSearch}
                className="rounded-md pl-9"
                placeholder={label("searchPlaceholder")}
                aria-label={label("searchPlaceholder")}
                onChange={(event) => setCatalogSearch(event.target.value)}
              />
            </div>

            <S.Select value={catalogType} onValueChange={setCatalogType}>
              <S.SelectTrigger
                className="w-40 rounded-md"
                aria-label={label("contentType")}
              >
                <S.SelectValue />
              </S.SelectTrigger>

              <S.SelectContent className="z-[9999] rounded-md">
                {CONTENT_TYPES.map((value) => (
                  <S.SelectItem key={value} value={value}>
                    {value === ALL ? label("allTypes") : humanizeEnumValue(value)}
                  </S.SelectItem>
                ))}
              </S.SelectContent>
            </S.Select>
          </div>

          {isCatalogLoading ? (
            <div className="mt-3 space-y-2" aria-busy="true">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : catalogResults.length === 0 ? (
            <p className="mt-3 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {label("noResults")}
            </p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {catalogResults.map((item) => (
                <li key={`${item.contentType}:${item.contentId}`}>
                  <button
                    type="button"
                    onClick={() => pickCatalogItem(item)}
                    aria-pressed={selectedContentId === item.contentId}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors",
                      selectedContentId === item.contentId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-primary/5",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {item.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {humanizeEnumValue(item.contentType)}
                        {item.provider ? ` · ${item.provider}` : ""}
                      </span>
                    </span>

                    {selectedContentId === item.contentId && (
                      <L.Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {form.formState.errors.contentId && (
            <p className="mt-2 text-sm text-destructive">{label("pickOne")}</p>
          )}
        </div>
      )}

      <FloatingTextareaField
        name="description"
        control={form.control}
        label={label("description")}
      />
    </div>
  );
};
