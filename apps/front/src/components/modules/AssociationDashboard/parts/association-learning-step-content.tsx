"use client";

import { TAssociationLearningStepContent } from "@/types/association-dashboard.types";
import { AssociationLearningExternalType } from "@/lib/graphql/base";
import { formatDurationMinutes } from "@utils/content-source.helper";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { FloatingInputField } from "@elements/floating-input";
import { humanizeEnumValue } from "@utils/function-helper";
import { ContentType } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

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

const EXTERNAL_TYPES = Object.values(AssociationLearningExternalType);

const KEY = "associationDashboard.learningContent.editor";

const metaLine = (
  t: (key: string, params?: Record<string, string | number>) => string,
  item: {
    level?: string | null;
    durationMinutes?: number | null;
    indicativeCredits?: number | null;
  },
) =>
  [
    item.level ? humanizeEnumValue(item.level) : null,
    formatDurationMinutes(item.durationMinutes),
    item.indicativeCredits
      ? t(`${KEY}.creditsShort`, { credits: item.indicativeCredits })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

export const AssociationLearningStepContent = ({
  hook,
}: TAssociationLearningStepContent) => {
  const {
    t,
    form,
    isExternal,
    catalogType,
    pickedTitle,
    catalogSearch,
    catalogResults,
    setCatalogType,
    switchToManual,
    pickCatalogItem,
    switchToLibrary,
    clearCatalogItem,
    setCatalogSearch,
    isCatalogLoading,
    selectedContentId,
    openDetailsSheet,
  } = hook;

  const label = (key: string, params?: Record<string, string | number>) =>
    t(`${KEY}.${key}`, params);

  const hasSelection = !isExternal && Boolean(selectedContentId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">{label("step1Title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {label("step1Subtitle")}
        </p>
      </div>

      {!isExternal && (
        <GlassCard glow={false}>
          <div className="relative z-10 space-y-3">
            <div>
              <p className="font-medium">{label("libraryTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {label("librarySubtitle")}
              </p>
            </div>

            {hasSelection ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-primary bg-primary/5 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <L.CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium">
                    {pickedTitle || label("contentPending")}
                  </span>
                </div>
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="outline"
                  onClick={clearCatalogItem}
                >
                  {label("change")}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
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
                          {value === ALL
                            ? label("allTypes")
                            : humanizeEnumValue(value)}
                        </S.SelectItem>
                      ))}
                    </S.SelectContent>
                  </S.Select>
                </div>

                {isCatalogLoading ? (
                  <div className="space-y-2" aria-busy="true">
                    {Array.from({ length: 3 }, (_, index) => (
                      <Skeleton
                        key={index}
                        className="h-20 w-full rounded-md"
                      />
                    ))}
                  </div>
                ) : catalogResults.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    <p>{label("noResults")}</p>
                    <Button
                      size="sm"
                      radius="xl"
                      type="button"
                      variant="outline"
                      className="mt-3"
                      onClick={switchToManual}
                    >
                      {label("enterManually")}
                    </Button>
                  </div>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {catalogResults.map((item) => {
                      const style = getContentTypeStyle(item.contentType);
                      const TypeIcon = style.icon;
                      const meta = metaLine(t, item);

                      return (
                        <li
                          key={`${item.contentType}:${item.contentId}`}
                          className="flex items-start gap-3 rounded-md border p-3"
                        >
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${style.softClass}`}
                          >
                            <TypeIcon className="h-4 w-4" aria-hidden />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.provider}
                            </p>
                            {meta ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {meta}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 flex-col gap-2">
                            <Button
                              size="sm"
                              radius="xl"
                              type="button"
                              variant="outline"
                              onClick={() => openDetailsSheet(item)}
                            >
                              {label("details")}
                            </Button>
                            <Button
                              size="sm"
                              radius="xl"
                              type="button"
                              onClick={() => pickCatalogItem(item)}
                            >
                              {label("useThis")}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {form.formState.errors.contentId && (
              <p className="text-sm text-destructive">{label("pickOne")}</p>
            )}
          </div>
        </GlassCard>
      )}

      {!isExternal && !hasSelection && (
        <GlassCard glow={false}>
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{label("notInLibraryTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {label("notInLibraryBody")}
              </p>
            </div>
            <Button
              radius="xl"
              type="button"
              variant="outline"
              onClick={switchToManual}
            >
              {label("enterManually")}
            </Button>
          </div>
        </GlassCard>
      )}

      {isExternal && (
        <GlassCard glow={false}>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">{label("manualTitle")}</p>
              <Button
                size="sm"
                radius="xl"
                type="button"
                variant="ghost"
                onClick={switchToLibrary}
              >
                <L.ArrowLeft className="h-4 w-4" />
                {label("searchInstead")}
              </Button>
            </div>

            <FloatingInputField
              name="externalTitle"
              control={form.control}
              label={label("title")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <S.Select
                value={form.watch("externalContentType") ?? ""}
                onValueChange={(value) =>
                  form.setValue(
                    "externalContentType",
                    value as AssociationLearningExternalType,
                    { shouldValidate: true, shouldDirty: true },
                  )
                }
              >
                <S.SelectTrigger
                  className="h-14 w-full rounded-md"
                  aria-label={label("contentType")}
                >
                  <S.SelectValue placeholder={label("contentType")} />
                </S.SelectTrigger>
                <S.SelectContent className="z-[9999] rounded-md">
                  {EXTERNAL_TYPES.map((value) => (
                    <S.SelectItem key={value} value={value}>
                      {humanizeEnumValue(value)}
                    </S.SelectItem>
                  ))}
                </S.SelectContent>
              </S.Select>

              <FloatingInputField
                name="externalProvider"
                control={form.control}
                label={label("provider")}
              />
            </div>

            {form.formState.errors.externalContentType && (
              <p className="text-sm text-destructive">{label("pickType")}</p>
            )}

            <FloatingInputField
              name="externalUrl"
              control={form.control}
              label={label("url")}
              placeholder="https://…"
            />
            {form.formState.errors.externalUrl && (
              <p className="text-sm text-destructive">{label("urlInvalid")}</p>
            )}
          </div>
        </GlassCard>
      )}

      <FloatingTextareaField
        name="description"
        control={form.control}
        label={label("description")}
      />
    </div>
  );
};

export default AssociationLearningStepContent;
