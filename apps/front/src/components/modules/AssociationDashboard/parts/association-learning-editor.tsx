"use client";

import { TAssociationLearningEditor } from "@/types/association-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { humanizeEnumValue } from "@utils/function-helper";
import { PDU_CATEGORIES } from "@utils/pdu.constant";
import { ContentType } from "@/lib/graphql/base";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import * as S from "@ui/select";
import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

const ALL = "ALL";

const CONTENT_TYPES = [
  ALL,
  ContentType.Course,
  ContentType.Event,
  ContentType.Podcast,
  ContentType.Youtube,
] as const;

const NO_REQUIREMENT = "NONE";

export const AssociationLearningEditor = ({
  hook,
}: TAssociationLearningEditor) => {
  const {
    t,
    form,
    isSaving,
    isEditing,
    isExternal,
    catalogType,
    closeEditor,
    isEditorOpen,
    catalogSearch,
    submitEditor,
    catalogResults,
    setCatalogType,
    pickCatalogItem,
    setCatalogSearch,
    isCatalogLoading,
    requirementOptions,
    selectedContentId,
  } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.editor.${key}`);

  return (
    <D.Dialog
      open={isEditorOpen}
      onOpenChange={(open) => {
        if (!open) closeEditor();
      }}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {label(
              isEditing
                ? "editTitle"
                : isExternal
                  ? "addExternalTitle"
                  : "addCatalogueTitle",
            )}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {label(isExternal ? "externalDescription" : "catalogueDescription")}
          </D.DialogDescription>
        </D.DialogHeader>

        <F.Form {...form}>
          <form className="space-y-4" onSubmit={submitEditor} noValidate>
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
                      className="rounded-2xl pl-9"
                      placeholder={label("searchPlaceholder")}
                      aria-label={label("searchPlaceholder")}
                      onChange={(event) => setCatalogSearch(event.target.value)}
                    />
                  </div>

                  <S.Select value={catalogType} onValueChange={setCatalogType}>
                    <S.SelectTrigger
                      className="w-40 rounded-2xl"
                      aria-label={label("contentType")}
                    >
                      <S.SelectValue />
                    </S.SelectTrigger>

                    <S.SelectContent className="z-[9999] rounded-2xl">
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
                  <div className="mt-3 space-y-2" aria-busy="true">
                    {Array.from({ length: 3 }, (_, index) => (
                      <Skeleton
                        key={index}
                        className="h-14 w-full rounded-2xl"
                      />
                    ))}
                  </div>
                ) : catalogResults.length === 0 ? (
                  <p className="mt-3 rounded-2xl border border-dashed border-glass-border p-6 text-center text-sm text-muted-foreground">
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
                            "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                            selectedContentId === item.contentId
                              ? "border-primary bg-primary/5"
                              : "border-glass-border hover:bg-primary/5",
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
                  <p className="mt-2 text-sm text-destructive">
                    {label("pickOne")}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingSelectField
                name="category"
                control={form.control}
                label={label("category")}
                options={PDU_CATEGORIES.map((value) => ({
                  value,
                  label: humanizeEnumValue(value),
                }))}
              />

              <FloatingInputField
                type="number"
                name="indicativeCredits"
                control={form.control}
                label={label("credits")}
              />
            </div>

            <FloatingSelectField
              name="requirementId"
              control={form.control}
              label={label("requirement")}
              options={[
                { value: NO_REQUIREMENT, label: label("noRequirement") },
                ...requirementOptions,
              ]}
            />

            <FloatingTextareaField
              name="description"
              control={form.control}
              label={label("description")}
            />

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="cancel"
                disabled={isSaving}
                onClick={closeEditor}
              >
                {t("associationDashboard.members.confirm.cancel")}
              </Button>

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={isSaving}
              >
                {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
                {label("save")}
              </Button>
            </D.DialogFooter>
          </form>
        </F.Form>
      </D.DialogContent>
    </D.Dialog>
  );
};
